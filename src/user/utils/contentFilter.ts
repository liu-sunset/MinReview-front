import { Filter } from 'bad-words';

/**
 * 内容过滤工具类，用于检测用户输入中的违规词汇
 */
export class ContentFilter {
  private static filter = new Filter();
  
  // 定义中文敏感词汇列表
  private static chineseBadWords = [
    '傻逼', '操你', '草你', '妈的', '他妈的', '滚蛋', '去死', '混蛋',
    '王八蛋', '狗屎', '白痴', '贱人', '婊子', '妓女', '废物', '垃圾人',
    '蠢货', '笨蛋', '废物', '猪头', '猪脑子', '狗东西', '狗娘养'
  ];
  
  // 初始化时添加中文敏感词汇
  static {
    ContentFilter.addWords(this.chineseBadWords);
  }
  
  /**
   * 添加自定义的敏感词汇
   * @param words 敏感词汇数组
   */
  public static addWords(words: string[]): void {
    this.filter.addWords(...words);
  }
  
  /**
   * 检查内容是否包含违规词汇
   * @param content 需要检查的内容
   * @returns 如果包含违规词汇返回true，否则返回false
   */
  public static containsProfanity(content: string): boolean {
    // 使用bad-words库检测
    if (this.filter.isProfane(content)) {
      return true;
    }
    
    // 检查内容是否包含任何中文敏感词
    return this.chineseBadWords.some(word => content.includes(word));
  }
  
  /**
   * 获取内容中的违规词汇
   * @param content 需要检查的内容
   * @returns 违规词汇数组
   */
  public static getProfanityList(content: string): string[] {
    const words = content.split(' ');
    return words.filter(word => this.filter.isProfane(word));
  }
  
  /**
   * 清理内容中的违规词汇，替换为 ***
   * @param content 需要清理的内容
   * @returns 清理后的内容
   */
  public static clean(content: string): string {
    return this.filter.clean(content);
  }
}