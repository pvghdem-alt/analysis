import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RegressionResult {
  m: number;
  b: number;
  r2: number;
  pValue: number;
  standardError: number;
}

export const columnNamesTw: Record<string, string> = {
  Gender: "性別",
  Age_Y: "出生年(民國)",
  Age_M: "出生月",
  Education: "教育程度",
  Marital: "婚姻狀況",
  Children: "子女人數",
  Family_Visit: "家人是否定期探訪",
  Advance_Directive: "簽署預立醫療決定",
  Income_Source: "經濟來源",
  Religion: "宗教信仰",
  Assistive_Device: "使用輔具狀況",
  Chronic_Disease: "目前有無罹患慢性病",
  ADL: "巴氏量表(ADL)",
  Health_Status: "自覺健康狀況",
  Hope_Future: "對未來的希望與期待",
  Main_Supporter: "平時主要提供支持的人",
  Move_In_Y: "入住年(民國)",
  Move_In_M: "入住月",
  Social_Support_Total: "社會支持總分",
  Hope_Total: "希望量表總分",
  Death_Attitude_Total: "死亡態度總分",
  
  // 社會支持量表 (Social Support)
  SS_1: "1.您有多少親近的朋友和親戚",
  SS_2: "2.當您臥病在床，有人幫助您",
  SS_3: "3.當您需要傾訴時，有人可以傾聽您的訴說",
  SS_4: "4.當您面臨危機時，有人可以給您好的建議",
  SS_5: "5.當您生病時，有人可以帶您去看醫生",
  SS_6: "6.有人可以給予您愛及關懷",
  SS_7: "7.有人可以與您共度美好時光",
  SS_8: "8.有人可以提供您訊息，幫助您了解狀況",
  SS_9: "9.有值得信賴的人可以傾吐您的個人問題",
  SS_10: "10.有人可以給您擁抱",
  SS_11: "11.有人可以聚一聚來放鬆心情",
  SS_12: "12.當您無法為自己準備三餐時，有人可以為您準備",
  SS_13: "13.有人可以給您良好的建議",
  SS_14: "14.有人可以陪您做些事來幫助您忘掉煩惱",
  SS_15: "15.當您生病時，有人可以幫忙家務",
  SS_16: "16.有人可以分享您最私人的煩惱和害怕",
  SS_17: "17.當您有個人問題時，有人可以給您建議如何處理問題",
  SS_18: "18.有人可以與您共同從事某項愉悅的事",
  SS_19: "19.有人可以了解您的問題",
  SS_20: "20.有人值得您去愛，及讓您覺得自己是被愛的",

  // 希望量表 (Hope Scale)
  H_1: "1.我對生命有積極的看法",
  H_2: "2.我對生命有目前和未來的計劃",
  H_3: "3.我覺得自己非常孤單",
  H_4: "4.在生命的黑暗時期，我仍然有信心",
  H_5: "5.我有信仰，祂能給我安慰和寄託",
  H_6: "6.我對自己的未來感到害怕",
  H_7: "7.我會回憶過去一些快樂、美好時光",
  H_8: "8.我內心有一種很強的力量支持我活下",
  H_9: "9.我能給予和接受別人的愛與關懷",
  H_10: "10.我有自己生活目標",
  H_11: "11.我相信自己每天都有發展的潛力",
  H_12: "12.我覺得生活有價值、有意義、過得很實在",

  // 死亡態度量表 (Death Attitude)
  DA_1: "1.死亡無疑是一種陰森恐怖的經驗",
  DA_2: "2.想到自己的死亡，我會焦慮不安",
  DA_3: "3.我會盡量可能避免去想到自己的死亡",
  DA_4: "4.我相信自己死後會到天堂/天國/極樂世界去",
  DA_5: "5.死亡將會結束我所有的煩惱",
  DA_6: "6.死亡應該被視為一種自然、無可否認又無法避免的事",
  DA_7: "7.我很困擾於「人一定會死亡」的這個宿命",
  DA_8: "8.我覺得死亡是通往快樂天堂/天國/極樂世界的入口",
  DA_9: "9.死亡可以讓我從這個糟糕的世界逃脫",
  DA_10: "10.一但有死亡的想法進入我的腦海，我會試著將它趕走",
  DA_11: "11.死亡是悲痛與苦難的解脫",
  DA_12: "12.我總是試著讓自己不要想到死亡這件事",
  DA_13: "13.我相信死後的世界會比現世的世界要好",
  DA_14: "14.我覺得死亡是生命歷程中自然的一部分",
  DA_15: "15.我覺得死亡是一種與上蒼(上帝神佛)或極樂世界的結合",
  DA_16: "16.死亡可以帶來一個全新燦爛願景",
  DA_17: "17.我並不害怕死亡也不歡迎它的到來",
  DA_18: "18.我對死亡有強烈的恐懼感",
  DA_19: "19.我完全避免將死亡與自己聯結在一起",
  DA_20: "20.我經常困擾於死後是否有來生",
  DA_21: "21.死亡意味著今生一切的結束，這樣的想法讓我感到害怕",
  DA_22: "22.我期望死後可以再和我愛的人團聚",
  DA_23: "23.我將死亡視為今生一切痛苦的結束",
  DA_24: "24.死亡只是生命過程的一部分",
  DA_25: "25.我視死亡為一個通往永恆幸福的路徑",
  DA_26: "26.我會盡量避開任何與死亡有關的事物",
  DA_27: "27.我覺得死亡為靈魂提供了最好的解脫",
  DA_28: "28.當我相信死後仍有生命，這是我面對死亡時最寬慰的事",
  DA_29: "29.我視死亡為放下今生重擔的方式",
  DA_30: "30.死亡既不是好事也不是壞事",
  DA_31: "31.我對死後的生命有所期待",
  DA_32: "32.對於死後的不確定性，讓我感到憂心",
};

export const columnGroups = [
  {
    label: "第一部分：【基本資料】",
    options: [
      "Gender", "Age_Y", "Age_M", "Education", "Marital", "Children", 
      "Family_Visit", "Advance_Directive", "Income_Source", "Religion", 
      "Assistive_Device", "Chronic_Disease", "ADL", "Health_Status", 
      "Hope_Future", "Main_Supporter", "Move_In_Y", "Move_In_M"
    ]
  },
  {
    label: "第二部分：【社會支持量表】",
    options: [
      "Social_Support_Total",
      ...Array.from({ length: 20 }, (_, i) => `SS_${i + 1}`)
    ]
  },
  {
    label: "第三部分：【希望量表】",
    options: [
      "Hope_Total",
      ...Array.from({ length: 12 }, (_, i) => `H_${i + 1}`)
    ]
  },
  {
    label: "第四部份：【死亡態度量表】",
    options: [
      "Death_Attitude_Total",
      ...Array.from({ length: 32 }, (_, i) => `DA_${i + 1}`)
    ]
  }
];

export function getColumnTitle(col: string) {
  if (columnNamesTw[col]) return columnNamesTw[col];

  return col;
}
