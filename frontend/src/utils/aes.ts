// AES加密函数，兼容CryptoJS的全局变量
// 依赖src/utils/aes.js已在index.html中引入
export function encryptAES(plainText: string): string {
  // @ts-ignore
  const CryptoJS = (window as any).CryptoJS;
  const key = CryptoJS.enc.Utf8.parse("JMybKEd6L1cVpw==");
  const srcs = CryptoJS.enc.Utf8.parse(plainText);
  return CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
} 