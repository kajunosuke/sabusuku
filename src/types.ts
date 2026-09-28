export type Cycle = 'monthly' | 'yearly';

export type CategoryId = 'video' | 'music' | 'book' | 'game' | 'tool' | 'other';

export type Subscription = {
  id: string;
  name: string;
  /** 1回あたりの支払い金額（円） */
  price: number;
  cycle: Cycle;
  /** 支払日（1〜31）。月末より大きい日は月末扱い */
  billingDay: number;
  /** 年額のときの支払月（1〜12） */
  billingMonth: number;
  category: CategoryId;
  /** プランから選んだ場合のプラン名 */
  plan?: string;
  /** 「最近使ってる？」への回答 */
  usage?: 'used' | 'unused';
  /** 上の回答をした日時 */
  usageCheckedAt?: number;
  createdAt: number;
};

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: 'video', label: '動画', emoji: '🎬', color: '#E5484D' },
  { id: 'music', label: '音楽', emoji: '🎵', color: '#12A594' },
  { id: 'book', label: '本', emoji: '📚', color: '#AB6400' },
  { id: 'game', label: 'ゲーム', emoji: '🎮', color: '#8E4EC6' },
  { id: 'tool', label: 'ツール', emoji: '🛠', color: '#0090FF' },
  { id: 'other', label: 'その他', emoji: '📦', color: '#F76B15' },
];

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export type Plan = {
  label: string;
  price: number;
  cycle: Cycle;
};

export type Service = {
  name: string;
  category: CategoryId;
  /** アイコン取得に使う公式サイトのドメイン */
  domain: string;
  plans: Plan[];
};

/** プランの料金を調べた時期（アプリ内の注意書きに表示） */
export const PRICES_AS_OF = '2026年9月';

const m = (label: string, price: number): Plan => ({ label, price, cycle: 'monthly' });
const y = (label: string, price: number): Plan => ({ label, price, cycle: 'yearly' });

/** よく使われるサービスとプラン（税込の目安。料金が変わったらここを更新） */
export const SERVICES: Service[] = [
  // 動画
  {
    name: 'Netflix',
    category: 'video',
    domain: 'netflix.com',
    plans: [m('広告つきスタンダード', 890), m('スタンダード', 1590), m('プレミアム', 2290)],
  },
  {
    name: 'Amazon Prime',
    category: 'video',
    domain: 'amazon.co.jp',
    plans: [m('月間プラン', 600), y('年間プラン', 5900)],
  },
  {
    name: 'YouTube Premium',
    category: 'video',
    domain: 'youtube.com',
    plans: [
      m('個人', 1280),
      y('個人', 12800),
      m('ファミリー', 2280),
      m('学生', 780),
      m('Premium Lite', 780),
    ],
  },
  {
    name: 'Disney+',
    category: 'video',
    domain: 'disneyplus.com',
    plans: [
      m('スタンダード', 1250),
      y('スタンダード', 12500),
      m('プレミアム', 1670),
      y('プレミアム', 16700),
    ],
  },
  { name: 'U-NEXT', category: 'video', domain: 'unext.jp', plans: [m('月額プラン', 2189)] },
  { name: 'Hulu', category: 'video', domain: 'hulu.jp', plans: [m('月額プラン', 1320)] },
  {
    name: 'ABEMAプレミアム',
    category: 'video',
    domain: 'abema.tv',
    plans: [m('広告つき', 680), m('プレミアム', 1180)],
  },
  {
    name: 'DAZN',
    category: 'video',
    domain: 'dazn.com',
    plans: [m('Standard（月間）', 4200), y('Standard（年間一括）', 32000)],
  },
  { name: 'dアニメストア', category: 'video', domain: 'animestore.docomo.ne.jp', plans: [m('月額プラン', 660)] },
  { name: 'Lemino', category: 'video', domain: 'lemino.docomo.ne.jp', plans: [m('Leminoプレミアム', 1540)] },
  { name: 'FOD', category: 'video', domain: 'fod.fujitv.co.jp', plans: [m('FODプレミアム', 1320)] },

  { name: 'DMM TV', category: 'video', domain: 'tv.dmm.com', plans: [m('DMMプレミアム', 550)] },
  {
    name: 'WOWOWオンデマンド',
    category: 'video',
    domain: 'wowow.co.jp',
    plans: [m('月額プラン', 2530)],
  },
  { name: 'Apple TV', category: 'video', domain: 'tv.apple.com', plans: [m('月額プラン', 1200)] },
  {
    name: 'NHKオンデマンド',
    category: 'video',
    domain: 'www.nhk-ondemand.jp',
    plans: [m('まるごと見放題パック', 990)],
  },
  { name: 'TELASA', category: 'video', domain: 'telasa.jp', plans: [m('見放題プラン', 990)] },
  {
    name: 'ニコニコプレミアム',
    category: 'video',
    domain: 'nicovideo.jp',
    plans: [m('月額プラン', 990), y('年額プラン', 9900)],
  },
  {
    name: 'J SPORTSオンデマンド',
    category: 'video',
    domain: 'www.jsports.co.jp',
    plans: [m('総合パック', 2980), y('総合年間パック', 26820)],
  },
  { name: 'SPOTV NOW', category: 'video', domain: 'spotvnow.jp', plans: [] },
  { name: 'バンダイチャンネル', category: 'video', domain: 'www.b-ch.com', plans: [] },
  {
    name: 'バスケットLIVE',
    category: 'video',
    domain: 'www.bleague.jp',
    plans: [m('月額プラン', 770), y('年額プラン', 5500)],
  },
  {
    name: 'ベースボールLIVE',
    category: 'video',
    domain: 'baseball.mb.softbank.jp',
    plans: [m('月額プラン', 770)],
  },
  { name: 'パ・リーグSpecial', category: 'video', domain: 'tv.rakuten.co.jp', plans: [m('月額プラン', 702)] },
  {
    name: 'Hulu | Disney+ セットプラン',
    category: 'video',
    domain: 'hulu.jp',
    plans: [m('スタンダード', 1890), m('プレミアム', 2150)],
  },
  {
    name: 'dアニメストア for Prime Video',
    category: 'video',
    domain: 'animestore.docomo.ne.jp',
    plans: [m('チャンネル料金', 660)],
  },
  { name: 'スカパー！', category: 'video', domain: 'skyperfectv.co.jp', plans: [] },
  { name: 'J:COM STREAM', category: 'video', domain: 'www.jcom.co.jp', plans: [] },
  { name: 'ひかりTV', category: 'video', domain: 'www.hikaritv.net', plans: [] },
  { name: 'Rakuten TV', category: 'video', domain: 'tv.rakuten.co.jp', plans: [] },
  { name: 'アニメタイムズ', category: 'video', domain: 'animetimes.jp', plans: [] },

  // 音楽
  {
    name: 'Spotify',
    category: 'music',
    domain: 'spotify.com',
    plans: [m('Standard', 1080), m('Duo', 1480), m('Family', 1880), m('Student', 580)],
  },
  {
    name: 'Apple Music',
    category: 'music',
    domain: 'music.apple.com',
    plans: [m('個人', 1180), m('ファミリー', 1980), m('学生', 680)],
  },
  {
    name: 'Amazon Music Unlimited',
    category: 'music',
    domain: 'music.amazon.co.jp',
    plans: [
      m('個人（プライム会員）', 1080),
      y('個人（プライム会員）', 10800),
      m('個人', 1180),
      m('ファミリー', 1980),
      y('ファミリー', 19800),
      m('学生', 580),
    ],
  },
  {
    name: 'YouTube Music',
    category: 'music',
    domain: 'music.youtube.com',
    plans: [m('個人', 1080), m('ファミリー', 1680), m('学生', 580)],
  },
  {
    name: 'LINE MUSIC',
    category: 'music',
    domain: 'music.line.me',
    plans: [m('一般（Web登録）', 980), m('一般（アプリ登録）', 1080), m('学生', 480)],
  },

  { name: 'AWA', category: 'music', domain: 'awa.fm', plans: [m('STANDARD', 980)] },

  { name: 'KKBOX', category: 'music', domain: 'kkbox.com', plans: [m('月額プラン', 1080)] },
  {
    name: '楽天ミュージック',
    category: 'music',
    domain: 'music.rakuten.co.jp',
    plans: [
      m('スタンダード', 980),
      m('楽天カード/モバイル会員', 780),
      m('ライト', 500),
      m('学生', 480),
    ],
  },
  {
    name: 'radikoプレミアム',
    category: 'music',
    domain: 'radiko.jp',
    plans: [
      m('エリアフリー', 385),
      y('エリアフリー', 5400),
      m('タイムフリー30', 480),
      y('タイムフリー30', 3240),
      m('ダブルプラン', 865),
    ],
  },
  { name: 'Qobuz', category: 'music', domain: 'qobuz.com', plans: [m('ソロ', 1480), m('学生', 599)] },
  { name: 'dヒッツ', category: 'music', domain: 'dhits.docomo.ne.jp', plans: [m('月額プラン', 690)] },
  { name: 'うたパス', category: 'music', domain: 'utapass.auone.jp', plans: [] },
  { name: 'カラオケJOYSOUND', category: 'music', domain: 'joysound.com', plans: [m('月額プラン', 250)] },
  { name: 'カラオケ@DAM', category: 'music', domain: 'www.clubdam.com', plans: [] },

  // 本
  { name: 'Kindle Unlimited', category: 'book', domain: 'kindle.com', plans: [m('月額プラン', 980)] },
  { name: 'Audible', category: 'book', domain: 'audible.co.jp', plans: [m('月額プラン', 1500)] },
  {
    name: '楽天マガジン',
    category: 'book',
    domain: 'magazine.rakuten.co.jp',
    plans: [m('月額プラン', 572), y('年額プラン', 5500)],
  },

  { name: 'dマガジン', category: 'book', domain: 'www.docomo.ne.jp/service/magazine', plans: [m('月額プラン', 580)] },
  { name: '日経電子版', category: 'book', domain: 'nikkei.com', plans: [m('月額プラン', 4277)] },

  {
    name: 'Amazon Kids+',
    category: 'book',
    domain: 'amazon.co.jp',
    plans: [m('プライム会員', 580), m('一般', 980)],
  },
  {
    name: 'コミックシーモア読み放題',
    category: 'book',
    domain: 'www.cmoa.jp',
    plans: [m('読み放題フル', 1480), m('読み放題ライト', 780)],
  },
  {
    name: 'audiobook.jp',
    category: 'book',
    domain: 'audiobook.jp',
    plans: [m('聴き放題', 1330), y('聴き放題（年割）', 9990)],
  },
  {
    name: '朝日新聞デジタル',
    category: 'book',
    domain: 'digital.asahi.com',
    plans: [m('ベーシック', 980), m('スタンダード', 1980)],
  },
  { name: '毎日新聞デジタル', category: 'book', domain: 'mainichi.jp', plans: [] },
  { name: 'NewsPicks', category: 'book', domain: 'newspicks.com', plans: [] },
  { name: '文春電子版', category: 'book', domain: 'bunshun.jp', plans: [] },
  { name: '東洋経済オンライン', category: 'book', domain: 'toyokeizai.net', plans: [] },
  { name: '日経ビジネス電子版', category: 'book', domain: 'business.nikkei.com', plans: [] },
  { name: 'ダイヤモンド・オンライン', category: 'book', domain: 'diamond.jp', plans: [] },
  { name: 'ブックパス', category: 'book', domain: 'bookpass.auone.jp', plans: [] },
  { name: '週刊少年ジャンプ定期購読', category: 'book', domain: 'shonenjumpplus.com', plans: [] },
  { name: 'まんが王国', category: 'book', domain: 'comic.k-manga.jp', plans: [] },

  // ゲーム
  {
    name: 'Nintendo Switch Online',
    category: 'game',
    domain: 'nintendo.com',
    plans: [
      m('個人（1か月）', 400),
      y('個人（12か月）', 3000),
      y('ファミリー（12か月）', 5800),
      y('個人＋追加パック（12か月）', 5900),
      y('ファミリー＋追加パック（12か月）', 9900),
    ],
  },
  {
    name: 'PlayStation Plus',
    category: 'game',
    domain: 'playstation.com',
    plans: [
      m('エッセンシャル', 850),
      y('エッセンシャル', 6800),
      m('エクストラ', 1300),
      y('エクストラ', 11700),
      m('プレミアム', 1550),
      y('プレミアム', 13900),
    ],
  },

  {
    name: 'Xbox Game Pass',
    category: 'game',
    domain: 'xbox.com',
    plans: [
      m('Essential', 850),
      m('Premium', 1300),
      m('Ultimate', 1550),
      m('PC Game Pass', 1300),
    ],
  },
  { name: 'Apple Arcade', category: 'game', domain: 'apple.com', plans: [m('月額プラン', 900)] },

  {
    name: 'Google Play Pass',
    category: 'game',
    domain: 'play.google.com',
    plans: [m('月額プラン', 600), y('年額プラン', 5400)],
  },
  {
    name: 'フォートナイト クルー',
    category: 'game',
    domain: 'fortnite.com',
    plans: [m('月額プラン', 1320)],
  },
  {
    name: 'ドラゴンクエストX',
    category: 'game',
    domain: 'www.dqx.jp',
    plans: [m('3キャラコース（30日）', 1200), m('4キャラコース（30日）', 1400), m('5キャラコース（30日）', 1500)],
  },
  {
    name: 'ファイナルファンタジーXIV',
    category: 'game',
    domain: 'finalfantasyxiv.com',
    plans: [m('エントリーコース（30日）', 1408)],
  },
  {
    name: 'GeForce NOW',
    category: 'game',
    domain: 'nvidia.com',
    plans: [m('Performance', 1790), m('Ultimate', 3580)],
  },
  { name: '原神', category: 'game', domain: 'genshin.hoyoverse.com', plans: [m('空月の祝福', 610)] },
  { name: '崩壊：スターレイル', category: 'game', domain: 'hsr.hoyoverse.com', plans: [m('列車補給標章', 610)] },
  {
    name: 'ゼンレスゾーンゼロ',
    category: 'game',
    domain: 'zenless.hoyoverse.com',
    plans: [m('インターノット会員権', 610)],
  },
  { name: 'EA Play', category: 'game', domain: 'ea.com', plans: [] },
  { name: 'Ubisoft+', category: 'game', domain: 'ubisoft.com', plans: [] },
  { name: 'Minecraft Realms', category: 'game', domain: 'minecraft.net', plans: [] },
  { name: 'Pokémon HOME', category: 'game', domain: 'home.pokemon.com', plans: [] },
  { name: 'Roblox Premium', category: 'game', domain: 'roblox.com', plans: [] },
  { name: 'Humble Choice', category: 'game', domain: 'humblebundle.com', plans: [] },

  // ツール・AI
  {
    name: 'iCloud+',
    category: 'tool',
    domain: 'icloud.com',
    plans: [m('50GB', 180), m('200GB', 540), m('2TB', 1800), m('6TB', 5500), m('12TB', 11000)],
  },
  { name: 'ChatGPT', category: 'tool', domain: 'chatgpt.com', plans: [m('Go', 1400), m('Plus', 3000)] },
  { name: 'Claude', category: 'tool', domain: 'claude.ai', plans: [m('Pro（$20・円は目安）', 3000)] },
  {
    name: 'Google One',
    category: 'tool',
    domain: 'one.google.com',
    plans: [m('Google AI Plus', 725), m('Google AI Pro', 2900)],
  },
  {
    name: 'Microsoft 365',
    category: 'tool',
    domain: 'microsoft365.com',
    plans: [m('Personal', 2130), y('Personal', 21300), m('Family', 2740), y('Family', 27400)],
  },
  {
    name: 'Adobe',
    category: 'tool',
    domain: 'adobe.com',
    plans: [
      m('フォトプラン', 2380),
      m('Creative Cloud Pro', 9080),
      y('Creative Cloud Pro（年間一括）', 102960),
    ],
  },
  {
    name: 'Apple One',
    category: 'tool',
    domain: 'apple.com',
    plans: [m('個人', 1350), m('ファミリー', 2500)],
  },
  {
    name: 'Canva',
    category: 'tool',
    domain: 'canva.com',
    plans: [m('Pro', 1180), y('Pro', 8300)],
  },
  { name: 'Dropbox', category: 'tool', domain: 'dropbox.com', plans: [m('Plus', 1500)] },
  {
    name: 'Notion',
    category: 'tool',
    domain: 'notion.com',
    plans: [m('プラス', 1800), y('プラス', 18000), m('プラス＆AI', 4000), y('プラス＆AI', 40000)],
  },
  { name: 'Perplexity', category: 'tool', domain: 'perplexity.ai', plans: [m('Pro（$20・円は目安）', 3000)] },
  { name: 'Evernote', category: 'tool', domain: 'evernote.com', plans: [] },
  { name: '1Password', category: 'tool', domain: '1password.com', plans: [] },
  { name: 'Bitwarden', category: 'tool', domain: 'bitwarden.com', plans: [] },
  { name: 'NordVPN', category: 'tool', domain: 'nordvpn.com', plans: [] },
  {
    name: 'ExpressVPN',
    category: 'tool',
    domain: 'expressvpn.com',
    plans: [y('ベーシック', 14999), y('アドバンス', 18999), y('Express Pro', 28999)],
  },
  { name: 'ノートン 360', category: 'tool', domain: 'norton.com', plans: [y('デラックス（3台）', 8180)] },
  { name: 'ウイルスバスター クラウド', category: 'tool', domain: 'trendmicro.com', plans: [y('3台版', 7480)] },
  { name: 'ESET', category: 'tool', domain: 'eset.com', plans: [] },
  {
    name: 'Zoom',
    category: 'tool',
    domain: 'zoom.us',
    plans: [m('プロ（月払い）', 2549), y('プロ（年払い）', 23988)],
  },
  { name: 'Slack', category: 'tool', domain: 'slack.com', plans: [] },
  {
    name: 'Google Workspace',
    category: 'tool',
    domain: 'workspace.google.com',
    plans: [m('Business Starter', 800)],
  },
  { name: 'Box', category: 'tool', domain: 'box.com', plans: [y('Personal Pro', 15840)] },
  { name: 'TeraBox', category: 'tool', domain: 'terabox.com', plans: [m('プレミアム', 360)] },
  {
    name: 'GitHub Copilot',
    category: 'tool',
    domain: 'github.com',
    plans: [m('Pro（$10・円は目安）', 1500)],
  },
  { name: 'Cursor', category: 'tool', domain: 'cursor.com', plans: [m('Pro（$20・円は目安）', 3000)] },
  { name: 'DeepL', category: 'tool', domain: 'deepl.com', plans: [m('Pro Starter', 1200)] },
  {
    name: 'Grammarly',
    category: 'tool',
    domain: 'grammarly.com',
    plans: [m('Pro（$30・円は目安）', 4500)],
  },
  {
    name: 'Midjourney',
    category: 'tool',
    domain: 'midjourney.com',
    plans: [
      m('Basic（$10・円は目安）', 1500),
      m('Standard（$30・円は目安）', 4500),
      m('Pro（$60・円は目安）', 9000),
    ],
  },
  { name: 'Goodnotes', category: 'tool', domain: 'goodnotes.com', plans: [] },
  { name: 'CLIP STUDIO PAINT', category: 'tool', domain: 'clipstudio.net', plans: [] },
  { name: 'Todoist', category: 'tool', domain: 'todoist.com', plans: [] },
  { name: 'CapCut', category: 'tool', domain: 'capcut.com', plans: [] },
  { name: 'Filmora', category: 'tool', domain: 'filmora.wondershare.jp', plans: [] },
  { name: 'Picsart', category: 'tool', domain: 'picsart.com', plans: [] },
  { name: 'VSCO', category: 'tool', domain: 'vsco.co', plans: [] },

  // その他
  {
    name: 'LYPプレミアム',
    category: 'other',
    domain: 'premium.yahoo.co.jp',
    plans: [m('通常（Web登録）', 508), m('ライトプラン', 290)],
  },
  {
    name: 'Uber One',
    category: 'other',
    domain: 'uber.com',
    plans: [m('標準', 698), y('標準', 5598), m('学生', 298), y('学生', 2298)],
  },
  {
    name: 'X Premium',
    category: 'other',
    domain: 'x.com',
    plans: [m('ベーシック', 368), m('プレミアム', 980), m('プレミアムプラス', 6080)],
  },
  { name: 'chocoZAP', category: 'other', domain: 'chocozap.jp', plans: [m('月額プラン', 3278)] },
  {
    name: 'スタディサプリ',
    category: 'other',
    domain: 'studysapuri.jp',
    plans: [m('月額プラン', 2178), y('12か月一括', 21780)],
  },
  {
    name: 'Wolt+',
    category: 'other',
    domain: 'wolt.com',
    plans: [m('月額プラン', 498), y('年額プラン', 3998)],
  },
  {
    name: 'Discord Nitro',
    category: 'other',
    domain: 'discord.com',
    plans: [
      m('Nitro', 1050),
      y('Nitro', 10500),
      m('Nitro Basic', 350),
      y('Nitro Basic', 3500),
    ],
  },
  { name: 'YouTubeメンバーシップ', category: 'other', domain: 'youtube.com', plans: [] },
  { name: 'pixivFANBOX', category: 'other', domain: 'fanbox.cc', plans: [] },
  { name: 'Fantia', category: 'other', domain: 'fantia.jp', plans: [] },
  { name: 'Patreon', category: 'other', domain: 'patreon.com', plans: [] },
  { name: 'Twitch サブスク', category: 'other', domain: 'twitch.tv', plans: [] },
  { name: 'ニコニコチャンネル', category: 'other', domain: 'ch.nicovideo.jp', plans: [] },
  { name: 'noteメンバーシップ', category: 'other', domain: 'note.com', plans: [] },
  { name: 'Duolingo', category: 'other', domain: 'duolingo.com', plans: [] },
  { name: 'DMM英会話', category: 'other', domain: 'eikaiwa.dmm.com', plans: [m('スタンダード（月8回）', 4880)] },
  { name: 'レアジョブ英会話', category: 'other', domain: 'rarejob.com', plans: [m('日常英会話（月8回）', 4980)] },
  { name: 'ネイティブキャンプ', category: 'other', domain: 'nativecamp.net', plans: [] },
  { name: 'スタディサプリENGLISH', category: 'other', domain: 'eigosapuri.jp', plans: [] },
  {
    name: 'Apple Fitness+',
    category: 'other',
    domain: 'apple.com',
    plans: [m('月額プラン', 980), y('年額プラン', 7800)],
  },
  {
    name: 'LEAN BODY',
    category: 'other',
    domain: 'lean-body.jp',
    plans: [m('月額プラン', 2178), y('12か月プラン', 19536)],
  },
  { name: 'SOELU', category: 'other', domain: 'soelu.com', plans: [m('ライトプラン', 3278)] },
  { name: 'Strava', category: 'other', domain: 'strava.com', plans: [] },
  { name: 'Calm', category: 'other', domain: 'calm.com', plans: [] },
  { name: 'Headspace', category: 'other', domain: 'headspace.com', plans: [] },
  { name: 'Pairs', category: 'other', domain: 'pairs.lv', plans: [] },
  { name: 'タップル', category: 'other', domain: 'tapple.me', plans: [m('1か月プラン', 3900)] },
  { name: 'Tinder', category: 'other', domain: 'tinder.com', plans: [] },
  { name: 'with', category: 'other', domain: 'with.is', plans: [] },
  { name: 'マネーフォワード ME', category: 'other', domain: 'moneyforward.com', plans: [] },
  { name: 'Zaim', category: 'other', domain: 'zaim.net', plans: [] },
  { name: 'auスマートパスプレミアム', category: 'other', domain: 'pass.auone.jp', plans: [] },
  { name: 'コストコ', category: 'other', domain: 'costco.co.jp', plans: [] },
  { name: 'JAF', category: 'other', domain: 'jaf.or.jp', plans: [y('個人会員', 4000)] },
  { name: 'AppleCare+', category: 'other', domain: 'apple.com', plans: [] },
  { name: 'Oisix', category: 'other', domain: 'oisix.com', plans: [] },
  { name: 'nosh', category: 'other', domain: 'nosh.jp', plans: [] },
];

export function findService(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name.trim());
}
