import Foundation
import MLX
import MLXNN
import MLXOptimizers
import MLXRandom

// MARK: - MNIST data loader

func downloadMNIST(url: String, to dest: URL) throws -> Data {
    if FileManager.default.fileExists(atPath: dest.path) {
        return try Data(contentsOf: dest)
    }
    print("  Downloading \(url) …")
    guard let data = try? Data(contentsOf: URL(string: url)!) else {
        throw NSError(domain: "MNIST", code: 1,
                      userInfo: [NSLocalizedDescriptionKey: "Download failed: \(url)"])
    }
    try data.write(to: dest)
    return data
}

func gunzip(_ data: Data) throws -> Data {
    let tmp = URL(fileURLWithPath: NSTemporaryDirectory())
        .appendingPathComponent(UUID().uuidString + ".gz")
    try data.write(to: tmp)
    let pipe = Pipe()
    let proc = Process()
    proc.executableURL = URL(fileURLWithPath: "/usr/bin/gunzip")
    proc.arguments = ["-c", tmp.path]
    proc.standardOutput = pipe
    try proc.run()
    let result = pipe.fileHandleForReading.readDataToEndOfFile()
    proc.waitUntilExit()
    try? FileManager.default.removeItem(at: tmp)
    return result
}

func parseImages(_ data: Data) -> MLXArray {
    let n    = Int(data[4])  << 24 | Int(data[5])  << 16 | Int(data[6])  << 8 | Int(data[7])
    let rows = Int(data[8])  << 24 | Int(data[9])  << 16 | Int(data[10]) << 8 | Int(data[11])
    let cols = Int(data[12]) << 24 | Int(data[13]) << 16 | Int(data[14]) << 8 | Int(data[15])
    let pixels = n * rows * cols
    var floats = [Float32](repeating: 0, count: pixels)
    data.withUnsafeBytes { ptr in
        let bytes = ptr.baseAddress!.assumingMemoryBound(to: UInt8.self).advanced(by: 16)
        for i in 0..<pixels { floats[i] = Float32(bytes[i]) / 255.0 }
    }
    return MLXArray(floats, [n, rows * cols])
}

func parseLabels(_ data: Data) -> MLXArray {
    let n = Int(data[4]) << 24 | Int(data[5]) << 16 | Int(data[6]) << 8 | Int(data[7])
    var labels = [Int32](repeating: 0, count: n)
    data.withUnsafeBytes { ptr in
        let bytes = ptr.baseAddress!.assumingMemoryBound(to: UInt8.self).advanced(by: 8)
        for i in 0..<n { labels[i] = Int32(bytes[i]) }
    }
    return MLXArray(labels, [n])
}

// MARK: - Model: 784 → 256 → 128 → 10 MLP

class MLP: Module, UnaryLayer {
    let l1: Linear
    let l2: Linear
    let l3: Linear

    override init() {
        l1 = Linear(784, 256)
        l2 = Linear(256, 128)
        l3 = Linear(128, 10)
        super.init()
    }

    func callAsFunction(_ x: MLXArray) -> MLXArray {
        var h = relu(l1(x))
        h = relu(l2(h))
        return l3(h)
    }
}

// MARK: - Helpers

func accuracy(logits: MLXArray, targets: MLXArray) -> Float {
    let preds = argMax(logits, axis: 1)
    let correct = (preds .== targets).sum()
    eval(correct)
    return Float(correct.item(Int32.self)) / Float(targets.shape[0])
}

// MARK: - Training epoch

func trainEpoch(
    model: MLP,
    optimizer: Adam,
    images: MLXArray,
    labels: MLXArray,
    batchSize: Int
) -> (loss: Float, throughput: Double) {
    let n = images.shape[0]
    var perm = Array(0..<n)
    perm.shuffle()

    // valueAndGrad with (Model, MLXArray, MLXArray) -> MLXArray signature
    let lossAndGrad = valueAndGrad(model: model) { m, xb, yb -> MLXArray in
        let logits = m(xb)
        return crossEntropy(logits: logits, targets: yb, reduction: .mean)
    }

    var totalLoss: Float = 0
    var batches = 0
    let t0 = Date()

    var i = 0
    while i + batchSize <= n {
        let batchIdx = MLXArray(perm[i..<(i + batchSize)].map { Int32($0) })
        let xb = images[batchIdx]
        let yb = labels[batchIdx]

        let (loss, grads) = lossAndGrad(model, xb, yb)
        optimizer.update(model: model, gradients: grads)
        eval(model, loss)

        totalLoss += loss.item(Float.self)
        batches += 1
        i += batchSize
    }

    let elapsed = Date().timeIntervalSince(t0)
    let samplesProcessed = batches * batchSize
    return (totalLoss / Float(batches), Double(samplesProcessed) / elapsed)
}

// MARK: - Entry point

@main
struct MNISTBenchmark {
    static func main() throws {
        let cacheDir = URL(fileURLWithPath: NSHomeDirectory())
            .appendingPathComponent(".cache/mnist")
        try FileManager.default.createDirectory(at: cacheDir, withIntermediateDirectories: true)

        let base = "https://storage.googleapis.com/cvdf-datasets/mnist"
        let fileNames = [
            "train-images-idx3-ubyte.gz",
            "train-labels-idx1-ubyte.gz",
            "t10k-images-idx3-ubyte.gz",
            "t10k-labels-idx1-ubyte.gz",
        ]

        print("=== MNIST MLX Swift — Apple M1 Benchmark ===\n")
        print("Loading MNIST …")

        var rawFiles: [String: Data] = [:]
        for name in fileNames {
            let gz = try downloadMNIST(url: "\(base)/\(name)", to: cacheDir.appendingPathComponent(name))
            rawFiles[name] = try gunzip(gz)
        }

        let trainImages = parseImages(rawFiles["train-images-idx3-ubyte.gz"]!)
        let trainLabels = parseLabels(rawFiles["train-labels-idx1-ubyte.gz"]!)
        let testImages  = parseImages(rawFiles["t10k-images-idx3-ubyte.gz"]!)
        let testLabels  = parseLabels(rawFiles["t10k-labels-idx1-ubyte.gz"]!)
        eval(trainImages, trainLabels, testImages, testLabels)
        print("  Train: \(trainImages.shape[0]) samples,  Test: \(testImages.shape[0]) samples\n")

        let model     = MLP()
        let optimizer = Adam(learningRate: 1e-3)

        let epochs    = 10
        let batchSize = 256

        print(String(format: "%-6s  %-10s  %-10s  %s", "Epoch", "Loss", "Test Acc", "Throughput"))
        print(String(repeating: "-", count: 52))

        var totalTrainSecs: Double = 0

        for epoch in 1...epochs {
            let (loss, tp) = trainEpoch(
                model: model, optimizer: optimizer,
                images: trainImages, labels: trainLabels,
                batchSize: batchSize
            )
            totalTrainSecs += Double(trainImages.shape[0]) / tp

            let logits = model(testImages)
            eval(logits)
            let acc = accuracy(logits: logits, targets: testLabels)

            print(String(format: "%-6d  %-10.4f  %-9.2f%%  %8.0f smp/s",
                         epoch, loss, acc * 100, tp))
        }

        print(String(repeating: "-", count: 52))
        print(String(format: "\nTotal training time : %.2f s  (%d epochs × 60 k samples)\n",
                     totalTrainSecs, epochs))

        // --- Forward-pass benchmark ---
        print("--- Forward-pass throughput (full 10 k test set, 100 runs) ---")
        // warmup
        let _ = model(testImages); eval(model(testImages))

        let runs = 100
        let t0 = Date()
        for _ in 0..<runs {
            let out = model(testImages)
            eval(out)
        }
        let elapsed = Date().timeIntervalSince(t0)
        print(String(format: "Avg latency  : %.3f ms / forward pass", elapsed / Double(runs) * 1000))
        print(String(format: "Throughput   : %.0f samples/sec", Double(runs * testImages.shape[0]) / elapsed))
    }
}
