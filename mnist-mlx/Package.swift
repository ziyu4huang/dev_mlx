// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "mnist-mlx",
    platforms: [.macOS(.v14)],
    dependencies: [
        .package(url: "https://github.com/ml-explore/mlx-swift", from: "0.21.0"),
    ],
    targets: [
        .executableTarget(
            name: "mnist-mlx",
            dependencies: [
                .product(name: "MLX", package: "mlx-swift"),
                .product(name: "MLXNN", package: "mlx-swift"),
                .product(name: "MLXOptimizers", package: "mlx-swift"),
                .product(name: "MLXRandom", package: "mlx-swift"),
            ],
            path: "Sources/mnist-mlx",
            swiftSettings: [
                .unsafeFlags(["-O"])
            ]
        ),
    ]
)
