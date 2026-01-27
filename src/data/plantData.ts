import plantFamiliesData from './plantFamilies.json';

export interface PlantFamily {
  id: string;
  sequenceNumber: number;
  category: number;
  chineseName: string;
  sourceType: string;
  familyOrder: number;
  latinName: string;
  memoryModule: string;
  identificationModule: string;
  // Compatibility fields
  description?: string;
  characteristics?: string[];
  commonSpecies?: string[];
  images?: string[];
  traits?: {
    growth: string[];
    root: string[];
    stem: string[];
    leaf: string[];
    flower: string[];
    fruit: string[];
  };
}

export interface PlantTrait {
  id: string;
  category: string;
  name: string;
  description: string;
}

export const plantTraits: PlantTrait[] = [
  // 生长习性
  { id: 'herb', category: '生长习性', name: '草本', description: '茎部柔软，通常一年生或多年生' },
  { id: 'shrub', category: '生长习性', name: '灌木', description: '木质茎，但相对较低，多分枝' },
  { id: 'tree', category: '生长习性', name: '乔木', description: '高大的木质植物，有明显主干' },
  { id: 'vine', category: '生长习性', name: '藤本', description: '茎部细长，需要依附其他物体生长' },
  { id: 'perennial', category: '生长习性', name: '多年生', description: '生命周期超过两年' },
  { id: 'annual', category: '生长习性', name: '一年生', description: '在一个生长季内完成生命周期' },
  { id: 'parasitic', category: '生长习性', name: '寄生', description: '依靠吸取其他生物的养分生存' },
  { id: 'evergreen', category: '生长习性', name: '常绿', description: '终年有绿叶的植物' },

  // 叶特征
  { id: 'alternate', category: '叶特征', name: '叶互生', description: '叶子在茎上交替排列' },
  { id: 'opposite', category: '叶特征', name: '叶对生', description: '叶子在茎上相对排列' },
  { id: 'whorled', category: '叶特征', name: '叶轮生', description: '三片或更多叶子在同一节点排列' },
  { id: 'simple', category: '叶特征', name: '单叶', description: '叶片完整，不分裂' },
  { id: 'compound', category: '叶特征', name: '复叶', description: '叶片分裂成多个小叶' },
  { id: 'stipule', category: '叶特征', name: '托叶', description: '叶柄基部的小型附属物' },
  { id: 'entire_margin', category: '叶特征', name: '全缘', description: '叶缘平滑，无锯齿或分裂' },
  { id: 'serrate_margin', category: '叶特征', name: '锯齿', description: '叶缘有尖锐的锯齿' },
  { id: 'leathery', category: '叶特征', name: '革质', description: '叶片质地坚韧如皮革' },
  { id: 'basal_leaves', category: '叶特征', name: '叶基生', description: '叶片丛生于根颈部' },

  // 花特征
  { id: 'radial', category: '花特征', name: '辐射对称', description: '花朵呈辐射状对称' },
  { id: 'bilateral', category: '花特征', name: '两侧对称', description: '花朵左右对称' },
  { id: 'bisexual', category: '花特征', name: '两性花', description: '同一朵花中既有雄蕊又有雌蕊' },
  { id: 'unisexual', category: '花特征', name: '单性花', description: '只有雄蕊或只有雌蕊的花' },
  { id: 'capitulum', category: '花特征', name: '头状花序', description: '花序轴缩短成头状或盘状' },
  { id: 'umbel', category: '花特征', name: '伞形花序', description: '花柄等长，自花轴顶端放射状发出' },
  { id: 'raceme', category: '花特征', name: '总状花序', description: '花轴长，花柄等长且交替排列' },
  { id: 'cyme', category: '花特征', name: '聚伞花序', description: '顶花先开，然后侧枝分生' },
  { id: 'labiate', category: '花特征', name: '唇形花冠', description: '花冠呈唇形，上下唇明显' },
  { id: 'tubular', category: '花特征', name: '管状花冠', description: '花冠呈管状' },
  { id: 'cruciform', category: '花特征', name: '十字形花冠', description: '四个花瓣呈十字形排列' },
  { id: 'funnelform', category: '花特征', name: '漏斗状花冠', description: '花冠呈漏斗状' },
  { id: 'campanulate', category: '花特征', name: '钟状花冠', description: '花冠像一口钟' },

  // 果实特征
  { id: 'berry', category: '果实特征', name: '浆果', description: '果实多汁，种子包埋在果肉中' },
  { id: 'capsule', category: '果实特征', name: '蒴果', description: '干燥果实，成熟时开裂释放种子' },
  { id: 'achene', category: '果实特征', name: '瘦果', description: '小型干燥果实，通常单种子' },
  { id: 'legume', category: '果实特征', name: '荚果', description: '豆类特有果实，沿腹缝和背缝开裂' },
  { id: 'drupe', category: '果实特征', name: '核果', description: '外果皮薄，中果皮肉质，内果皮坚硬' },
  { id: 'pome', category: '果实特征', name: '梨果', description: '花托发育而成的肉质果实' },
  { id: 'follicle', category: '果实特征', name: '蓇葖果', description: '由单心皮发育，成熟时仅沿一缝线开裂' },
  { id: 'samara', category: '果实特征', name: '翅果', description: '果皮延伸成翅状，利于随风传播' },

  // 根特征
  { id: 'taproot', category: '根特征', name: '主根系', description: '有明显的主根和侧根' },
  { id: 'fibrous', category: '根特征', name: '须根系', description: '没有明显主根，由许多不定根组成' },
  { id: 'rhizome_root', category: '根特征', name: '根状茎', description: '地下的根状变态茎' },

  // 茎特征
  { id: 'square_stem', category: '茎特征', name: '方茎', description: '茎的横切面为四方形' },
  { id: 'woody', category: '茎特征', name: '木质茎', description: '茎部坚硬，木质化' },
  { id: 'herbaceous', category: '茎特征', name: '草质茎', description: '茎部柔软，非木质' },
  { id: 'milky_sap', category: '茎特征', name: '乳汁', description: '切开茎部有白色乳液流出' }
];

// Helper to parse identificationModule into structured traits
const parseTraits = (idModule: string) => {
  const traits: any = {
    growth: [],
    root: [],
    stem: [],
    leaf: [],
    flower: [],
    fruit: []
  };

  const textSegments = idModule.split(/[。；,，\s]/).map(s => s.trim()).filter(Boolean);

  textSegments.forEach(segment => {
    plantTraits.forEach(trait => {
      if (segment.includes(trait.name) || trait.name.includes(segment)) {
        switch (trait.category) {
          case '生长习性': traits.growth.push(trait.name); break;
          case '根特征': traits.root.push(trait.name); break;
          case '茎特征': traits.stem.push(trait.name); break;
          case '叶特征': traits.leaf.push(trait.name); break;
          case '花特征': traits.flower.push(trait.name); break;
          case '果实特征': traits.fruit.push(trait.name); break;
        }
      }
    });
  });

  // Deduplicate
  Object.keys(traits).forEach(key => {
    traits[key] = [...new Set(traits[key])];
  });

  return traits;
};

// Map CSV data to PlantFamily interface
// Using getters to defer expensive parsing of characteristics and traits until they are actually accessed
export const plantFamilies: PlantFamily[] = (plantFamiliesData as any[]).map(item => {
  let _characteristics: string[] | null = null;
  let _traits: PlantFamily['traits'] | null = null;

  return {
    ...item,
    description: item.memoryModule,
    commonSpecies: [],
    images: [],
    get characteristics() {
      if (!_characteristics) {
        _characteristics = item.memoryModule.split(/[。；]/).filter(Boolean);
      }
      return _characteristics;
    },
    get traits() {
      if (!_traits) {
        _traits = parseTraits(item.identificationModule);
      }
      return _traits;
    }
  } as PlantFamily;
});

// MorphologyQuizItem and logic will be handled in the ImageQuiz component
// based on atlasItems, but we keep the interface here for compatibility if needed.
export interface MorphologyQuizItem {
  id: string;
  term: string;
  imageUrl: string;
  description: string;
}

// We'll keep these as placeholders or remove if they cause confusion,
// but since the plan is to revamp ImageQuiz to use atlasItems, these are less critical.
export const morphologyQuizData: MorphologyQuizItem[] = [];

export interface QuizQuestion {
  familyId: string;
  questionId: string;
  prompt: string;
  targetFeatureCategory: string;
  acceptableKeywords: string[];
  points: number;
  imageUrl?: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    familyId: "rosaceae",
    questionId: "rosaceae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["5", "杏", "五", "梨果", "桃", "核果", "聚合果", "苹果", "蔷薇果"],
    points: 20,
  },
  {
    familyId: "leguminosae",
    questionId: "leguminosae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["三出复叶", "复叶", "荚果", "掌状复叶", "羽状复叶"],
    points: 25,
  },
  {
    familyId: "compositae",
    questionId: "compositae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["头状", "头状花序", "瘦果"],
    points: 25,
  },
  {
    familyId: "labiatae",
    questionId: "labiatae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["二唇形", "唇形", "方茎", "四棱", "四棱形"],
    points: 20,
  },
  {
    familyId: "cruciferae",
    questionId: "cruciferae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["4", "十字", "十字形", "四"],
    points: 10,
  },
  {
    familyId: "solanaceae",
    questionId: "solanaceae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["增大", "宿存", "宿存并增大", "浆果", "蒴果"],
    points: 20,
  }
].filter(q => plantFamilies.some(f => f.id === q.familyId));
