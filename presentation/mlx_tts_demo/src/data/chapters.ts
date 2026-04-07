export interface Segment {
  id: string;
  character: string;
  text: string;
  voice: string;
  emotion: string;
  speed: number;
}

// Chapter 1 - first 10 segments (~80s of audio)
export const chapter1Segments: Segment[] = [
  {
    id: "seg_1",
    character: "Narrator",
    text: "台北的夜市，是一鍋永遠煮不滾的湯。火在底下燒著，人在上面浮著，誰也不知道什麼時候會被撈起來。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_2",
    character: "Narrator",
    text: "士林夜市大南路盡頭，有一攤賣了四十年的滷肉飯。攤位的招牌早已褪色，只隱約看得見「老張滷肉飯」四個字。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_3",
    character: "Narrator",
    text: "他叫張福全，六十七歲，大家都叫他全叔。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_4",
    character: "阿娥",
    text: "全叔，今天滷蛋夠不夠？",
    voice: "zf_xiaobei",
    emotion: "neutral",
    speed: 1.0,
  },
  {
    id: "seg_5",
    character: "Narrator",
    text: "隔壁賣蚵仔煎的阿娥探過頭來問。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_6",
    character: "Narrator",
    text: "全叔頭也不抬，手裡的鍋鏟翻攪著鍋裡的肉塊，聲音低沉——",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_7",
    character: "全叔",
    text: "不夠。昨天多賣了三十碗，蛋不夠了。",
    voice: "zm_yunxi",
    emotion: "neutral",
    speed: 0.95,
  },
  {
    id: "seg_8",
    character: "阿娥",
    text: "要不要我幫你從市場帶一些？我等等要去補貨。",
    voice: "zf_xiaobei",
    emotion: "neutral",
    speed: 1.0,
  },
  {
    id: "seg_9",
    character: "全叔",
    text: "不用了，我自己去。",
    voice: "zm_yunxi",
    emotion: "neutral",
    speed: 0.95,
  },
  {
    id: "seg_10",
    character: "Narrator",
    text: "全叔把火轉小，擦了擦手上的油漬，從攤位下面拿出一個紅色塑料袋。他走出夜市的時候，經過了那家新開的日式拉麵店。店門口排著長長的隊伍，年輕人舉著手機拍照。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
];

// Chapter 2 - first 10 segments (~70s of audio)
export const chapter2Segments: Segment[] = [
  {
    id: "seg_1",
    character: "Narrator",
    text: "張哲在台北車站下了高鐵，背著一個黑色雙肩包，站在人潮中愣了好一會兒。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_2",
    character: "Narrator",
    text: "他是全叔的孫子，二十六歲，在新竹科學園區一家半導體公司做工程師。每次回來，他都會去夜市幫阿公收攤，順便吃一碗滷肉飯。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_3",
    character: "Narrator",
    text: "但這次不一樣。",
    voice: "zm_yunjian",
    emotion: "serious",
    speed: 0.95,
  },
  {
    id: "seg_4",
    character: "Narrator",
    text: "他摸了摸口袋裡的那封信。信是上週收到的，來自一間律師事務所。所有攤位必須在三個月內遷出。",
    voice: "zm_yunjian",
    emotion: "serious",
    speed: 0.95,
  },
  {
    id: "seg_5",
    character: "Narrator",
    text: "三個月。",
    voice: "zm_yunjian",
    emotion: "serious",
    speed: 0.9,
  },
  {
    id: "seg_6",
    character: "Narrator",
    text: "張哲深吸一口氣，走出了車站。外頭的空氣濕熱，帶著台北特有的那種悶。他叫了一輛計程車，報了地址。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_7",
    character: "計程車司機",
    text: "士林夜市？現在的夜市都是觀光客去的啦，東西又貴又不好吃。",
    voice: "zm_yunxi",
    emotion: "neutral",
    speed: 1.0,
  },
  {
    id: "seg_8",
    character: "Narrator",
    text: "司機從後視鏡裡看了他一眼。張哲沒有回答。他看著窗外飛逝的街景，心裡在想該怎麼跟阿公開口。",
    voice: "zm_yunjian",
    emotion: "storytelling",
    speed: 0.97,
  },
  {
    id: "seg_9",
    character: "Narrator",
    text: "計程車停在夜市入口。張哲付了錢，下車，順著大南路往裡走。空氣裡瀰漫著各種食物的氣味——炸雞排的油香、珍珠奶茶的甜膩、炭烤的焦香。",
    voice: "zm_yunjian",
    emotion: "calm",
    speed: 0.92,
  },
  {
    id: "seg_10",
    character: "Narrator",
    text: "遠遠地，他看見了那個熟悉的攤位。全叔正低著頭切滷蛋，動作嫺熟得像是在做一件永遠不需要思考的事。",
    voice: "zm_yunjian",
    emotion: "calm",
    speed: 0.92,
  },
];

export const emotionColors: Record<string, string> = {
  storytelling: "#7c6af7",
  neutral: "#60a5fa",
  calm: "#4ade80",
  sad: "#a78bfa",
  serious: "#fbbf24",
  happy: "#f472b6",
};

export const characterColors: Record<string, string> = {
  Narrator: "#e2e4f0",
  全叔: "#a78bfa",
  阿娥: "#60a5fa",
  張哲: "#4ade80",
  蛋行老闆: "#fbbf24",
  計程車司機: "#f87171",
};
