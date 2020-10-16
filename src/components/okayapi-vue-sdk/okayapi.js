let util = require('./md5.js')  

export default {
  encrypt(params) {
    // const app = getApp()
    
    const OKAYAPI_APP_KEY = "F5AA434D7E3DCD41122D77B72D667789"
    const OKAYAPI_APP_SECRECT = "Z2LVlKRWuU4El36uwkaKeXcbcvEqz6Qs1b2XF0yxgjtDBHE0rvYeLIPbk" // TODO：请勿对外暴露！！
  
    params['app_key'] = OKAYAPI_APP_KEY
    params['sign'] = '' // 屏蔽sign参数
  
    var sdic = Object.keys(params).sort();
    var paramsStrExceptSign = "";
    for (let ki in sdic) {
      paramsStrExceptSign += params[sdic[ki]];
    }
  
    var sign = util.hexMD5(paramsStrExceptSign + OKAYAPI_APP_SECRECT).toUpperCase();
    params['sign'] = sign;
  
    return params;
  },
  YESAPI_HOST : 'http://hn216.api.yesapi.cn/'
}


// module.exports = {
//   enryptData: enryptData
// }  
// Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>'
// 原因是：The code above is ok. You can mix require and export. You can‘t mix import and module.exports.
// 翻译过来就是说，代码没毛病，在webpack打包的时候，可以在js文件中混用require和export。但是不能混用import 以及module.exports。
