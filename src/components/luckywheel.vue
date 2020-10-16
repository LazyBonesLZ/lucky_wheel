<template>
  <div class="container">
    <div class="lucky-wheel">
      <div class="lucky-title"></div>
      <div class="btn_tart"></div>
      <div class="wheel-main">
        <div class="wheel-pointer" @click="beginRotate()"></div>
        <div class="wheel-bg" :style="rotateStyle">
          <div class="prize-list">
            <div
              class="prize-item"
              v-for="(item,index) in prizeList"
              :key="index"
              :style="item.style"
            >
              <div class="prize-pic">
                <img :src="item.icon" />
              </div>
              <div class="prize-type">{{item.name}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="main-bg"></div>
      <div class="bg-p"></div>
      <!-- <div class="content">
        <div class="count">今日抽奖次数剩余：{{ count}} 次</div>
      </div> -->
      <div class="content">
        <div class="count" v-if="userName">欢迎您：{{ userName}}</div>
      </div>
       <div class="prize-controller" v-if="isAdmin()">
          <div class="tip-prize-content2"><img src="../assets/img/bean_one.png" width="20px" height="20px"/> 奖池1: >>>>555 ~ 666元  
            <toggle-button 
               :width = "60"
               @change="prizeLevelControllerChanged('1')"
               :value="checkPrizeLevelIsOnOrOff(1)"
               :sync = true
               :labels="{checked: '开始', unchecked: '结束'}"/>
          </div>
         <div class="tip-prize-content2"><img src="../assets/img/bean_one.png" width="20px" height="20px"/> 奖池2: >>>888 ~ 1288元  
          <toggle-button 
               :width = "60"
                @change="prizeLevelControllerChanged('2')"
                :value="checkPrizeLevelIsOnOrOff(2)"
               :sync = true
               :labels="{checked: '开始', unchecked: '结束'}"/>
          </div>
          <div class="tip-prize-content2"><img src="../assets/img/bean_one.png" width="20px" height="20px"/> 奖池3: >>1399 ~ 1999元  
            <toggle-button 
               :width = "60"
                @change="prizeLevelControllerChanged('3')"
                :value="checkPrizeLevelIsOnOrOff(3)"
               :sync = true
               :labels="{checked: '开始', unchecked: '结束'}"/>
          </div>
        
        </div>
      <div class="tip" >
        <div class="tip-title">活动规则</div>
        <div class="tip-content" v-if="isAdmin()">
            <p>1.管理员需先输入密码登录。</p>
            <p>2.需要控制每个奖池的活动开始和结束，避免无效的抽奖数据。</p>
            <p>3.所有中奖记录可在【抽奖记录】中查看，可手动删除无效中奖记录。</p>
        </div>
        <div class="tip-content" v-else>
            <p>1.请先报名，参与抽奖。</p>
            <p>2.每个奖池每人仅限一次抽奖机会。</p>
            <p>3.中奖记录可以在【抽奖记录】中查看。</p>
            <p>4.{{prizeLevelName}}</p>
        </div>
      </div>
       <div class="tip">
        <div class="tip-title">抽奖记录</div>
        <div class="tip-prize-content" v-if="isAdmin()">
           <div v-for='(item, index) in ownedPrizeList' :key="index"> <button class="btn_round_conner button-glow" @click="deletePrizeFromOwnedList(item)">X</button> {{item.prizedTime1}}  {{item.userName}} 
             <p class="tip-prize-content2">【{{item.prizeName}}】</p>
           </div>
        </div>
        <div class="tip-prize-content" v-else>
            <p v-for='(item, index) in ownedPrizeList' :key="index">{{item.prizedTime1}} 【{{item.prizeName}}】</p>
        </div>
      </div>
    </div>
     <!-- 中奖提示弹窗 -->
    <div class="toast" v-show="prize">
      <div class="toast-container">
        <img :src="toastIcon" class="toast-picture" />
        <div class="close" @click="closeToast()"></div>
        <div class="toast-title">{{toastTitle}}</div>
        <div class="toast-btn">
          <div class="toast-cancel" @click="closeToast">关闭</div>
        </div>
      </div>
    </div>
    <div class="toast-mask" v-show="prize"></div>
    <!-- 普通消息弹窗 -->
    <div class="toast" v-show="message">
      <div class="toast-container">
        <div class="close" @click="closeToast()"></div>
        <div class="toast-title">{{message}}</div>
        <div class="toast-btn">
          <div class="toast-cancel" @click="closeToast">关闭</div>
        </div>
      </div>
    </div>
    <div class="toast-mask" v-show="message"></div>
    <!-- 登录弹窗 -->
    <div class="toast" v-if = bLogin>
      <div class="toast-container">
        <div  v-if="isAdmin()">
          <div class="toast-login-title">欢迎您，尊敬的管理员</div>
          <input v-model="adminPassword" type="password" class= "toast-login-input" placeholder="请输入管理员密码">
           <div class="toast-login-message">{{loginMessage}}</div>
          <div class="toast-btn" @click="login()">
            <div>登录</div>
          </div>
        </div>
        <div v-else >
          <div class="toast-login-title">请报名参加抽奖吧^_^</div>
          <input v-model="userName" class= "toast-login-input" placeholder="请输入您的姓名">
           <div class="toast-login-message">{{loginMessage}}</div>
          <div class="toast-btn" @click="login()">
            <div>报名</div>
          </div>
        </div>
      </div>
    </div>
    <div class="toast-mask" v-if = bLogin></div>
   
  </div>
</template>
<script>
import { prizeList } from './config'
import { utils } from './utils'
import * as okayapi from './okayapi-vue-sdk/okayapi.js';
import yesapi from './yesapi.js';
const CIRCLE_ANGLE = 360

const config = {
  // 总旋转时间
  duration: 4000,
  // 旋转圈数
  circle: 8,
  mode: 'ease-in-out'
}

export default {
  data() {
    return {
      bLogin: true, //是否显示登录框
      loginMessage:null,
      userName:null,
      adminPassword:null,
      count: 1, // 剩余抽奖次数
      duration: 3000, // 转盘旋转时间
      prizeList: [], // 奖品列表
      rotateAngle: 0, // 旋转角度
      message:null,
      index: 0,
      prize: null,
      prizeLevelName:null,
      prizeLevel: -1, //奖池等级
      ownedPrizeList:[],
      prizeLevelController:{
        id:-1,
        groupName:'cindy',
        level1: 1,
        level2: 1,
        level3: "0",
      }
    };
  },
  created() {
    // 初始化一些值
    this.angleList = []
    // 是否正在旋转
    this.isRotating = false
    // 基本配置
    this.config = config

    this.prizeLevel = utils.getUrlKey('level')
    console.log("got prizeLevel from URL: prizeLevel = " + this.prizeLevel)
    // user ID
    this.initUserId();

    // 获取奖品列表
    this.initPrizeList();
  },
  computed: {
    rotateStyle () {
      return `
        -webkit-transition: transform ${this.config.duration}ms ${this.config.mode};
        transition: transform ${this.config.duration}ms ${this.config.mode};
        -webkit-transform: rotate(${this.rotateAngle}deg);
            transform: rotate(${this.rotateAngle}deg);`
    },
    toastTitle () {
      return this.prize && this.prize.isPrize === 1
        ? "啊咧，一级棒👍\n恭喜您，获得" +
            // this.prize.name
            this.getPrizeName()
        : "未中奖";
        
    },
    toastIcon() {
      return this.prize && this.prize.isPrize === 1
        ? require("../assets/img/congratulation.png")
        : require("../assets/img/sorry.png");
    }
  },
  methods: {
    initUserId(){
      console.log('initUserId------------>')
      if (localStorage.userId) {
        this.userId = localStorage.userId;
      }else{
        this.userId = utils.generateUUID();
        localStorage.userId = this.userId
      }
      if(this.isAdmin()){
        this.userName = '管理员';
        localStorage.removeItem ('userName')
      }else{
        if(localStorage.userName){
          this.bLogin = false;
          this.userName = localStorage.userName;
        }
      }
         
    },
    checkPrizeLevelIsOnOrOff(id){
      if(id == 1)
        return this.prizeLevelController.level1 == 1;
      if(id == 2)
        return this.prizeLevelController.level2 == 1;
      if(id == 3)
        return this.prizeLevelController.level3 === '1';
      return false;
    },
    prizeLevelControllerChanged(toggle){
      if(toggle === '1'){
        this.prizeLevelController.level1 = this.prizeLevelController.level1 == 1 ? 0 : 1
        console.log("this.prizeLevelController.level1 = " + this.prizeLevelController.level1)
      }else if(toggle === '2'){
        this.prizeLevelController.level2 = this.prizeLevelController.level2 == 1 ? 0 : 1
        console.log("this.prizeLevelController.level2 = " + this.prizeLevelController.level2)
      }else if(toggle === '3'){
        this.prizeLevelController.level3 = this.prizeLevelController.level3 == '1' ? '0' : '1'
        console.log("this.prizeLevelController.level3 = " + this.prizeLevelController.level3)
      }
      //状态，上传服务器
     this.updateServerPrizeLevelController();
    },
    login(){
       if(this.isAdmin()){
        if(this.adminPassword != null){
            if(this.adminPassword === yesapi.ADMIN_PWD){
              this.bLogin = false;
            }else{
              this.loginMessage = '管理员密码错误';
            }
            
          }else{
            this.loginMessage = '请先输入管理员密码(^-^)';
          }
      }else{
         if(this.userName != null){
            localStorage.userName = this.userName;
            this.bLogin = false;
          }else{
            this.loginMessage = '请先输入您的姓名(^-^)';
          }
      }
     
    },
    initPrizeList() {
      // 这里可以发起请求，从服务端获取奖品列表
      // 这里使用模拟数据
      this.prizeList = this.formatPrizeList(prizeList)
      this.prizeLevelName = this.getPrizeLevelName()

      this.queryPrizeFromSever()
      this.queryPrizeLevelController();
    },
    // 奖池显示的名称
    getPrizeLevelName(){
      if(this.prizeLevel == 1){
        return "当前奖金池：【555元 ~ 666元】。"
      }else if(this.prizeLevel == 2){
        return "当前奖金池：【888元 ~ 1288元】。"
      }else if(this.prizeLevel == 3){
        return "当前奖金池：【1399元 ~ 1999元】。"
      }else{
        return "您当前为奖池管理员。"
      }
    },
    // 判断是否为管理员
    isAdmin(){
      var b = true;
      if(this.prizeLevel == '1' || this.prizeLevel == '2' || this.prizeLevel == '3'){
        b = false;
      }
      console.log("Check isAdmin:" + b)
      return b;
    },
    // 格式化奖品列表，计算每个奖品的位置
    formatPrizeList (list) {
      // 记录每个奖的位置
      const angleList = []

      const l = list.length
      // 计算单个奖项所占的角度
      const average = CIRCLE_ANGLE / l

      const half = average / 2

      // 循环计算给每个奖项添加style属性
      list.forEach((item, i) => {

        // 每个奖项旋转的位置为 当前 i * 平均值 + 平均值 / 2
        const angle = -((i * average) + half)
        // 增加 style
        item.style = `-webkit-transform: rotate(${angle}deg);
                      transform: rotate(${angle}deg);`

        // 记录每个奖项的角度范围
        angleList.push((i * average) + half )
      })

      this.angleList = angleList

      return list
    },
    beginRotate() {
      // 添加次数校验
      if(this.checkRoateable() === false) return
      if(this.count === 0) return

      // 开始抽奖
      // 这里这里向服务端发起请求，得到要获得的奖
      // 可以返回下标，也可以返回奖品 id，通过查询 奖品列表，最终得到下标

      // 随机获取下标
      // this.index = this.random(this.prizeList.length - 1);
      // 根据指定的概率和奖池，获取下标

      /*
      三个奖金池，每个奖金池不限制抽奖次数
      1.555-666的奖金池中（中555的概率为10%；中600元的概率在80%；中666的概率为10%）
      2.888元~1288的奖金池中（中888的概率为90%；中1000的概率为10%，）
      3.1399元~1999的奖金池中（中1399的概率为10%，中1500的概率为89%，中1999的概率为1%）
      */
      if(this.prizeLevel < 0 || this.prizeLevel === null) return
      console.log("this.prizeLevel>>:" + this.prizeLevel)

      const randomInt = this.random(100,1)
      console.log("randomInt:" + randomInt)
      if(this.prizeLevel == 1){
        if(randomInt > 90){
          this.index = 0 // 666
        }else if(randomInt > 20 && randomInt <= 90 ){
          this.index = 2 //600
        }else{
          this.index = 4 // 555
        }
      }else if(this.prizeLevel == 2){
        if(randomInt >= 90 ){
          this.index = 0 //1000
        }else{
          this.index = 4 // 888
        }
      }else if(this.prizeLevel == 3){
        if(randomInt >= 99){
          this.index = 0 // 1999
        }else if(randomInt > 20 && randomInt < 90 ){
          this.index = 2 //1599
        }else{
          this.index = 4 // 1399
        }
      }

      // 减少剩余抽奖次数
      this.count--
  
      // 开始旋转
      this.rotating()
    },
    random (max, min = 0) {
      return parseInt(Math.random() * (max - min + 1) + min)
    },
    getPrizeName(){
       console.log("this.index:" + this.index)
      if(this.prizeLevel == 1){
        if(this.index === 0){
           return "666元现金"
        }else if(this.index === 2 ){
           return "600元现金"
        }else if(this.index === 4 ){
           return "555元现金"
        }
      }else if(this.prizeLevel == 2){
         if(this.index === 0){
           return "1000元现金"
        }else if(this.index === 4 ){
           return "888元现金"
        }
      }else if(this.prizeLevel == 3){
        if(this.index === 0){
           return "1999元现金"
        }else if(this.index === 2 ){
           return "1599元现金"
        }else if(this.index === 4 ){
           return "1399元现金"
        }
      }
    },
    rotating() {
      const { isRotating, angleList, config, rotateAngle, index } = this

      if (isRotating) return

      this.isRotating = true
    
      // 计算角度
      const angle =
          // 初始角度
          rotateAngle +
          // 多旋转的圈数
          config.circle * CIRCLE_ANGLE +
          // 奖项的角度
          angleList[index] -
          (rotateAngle % CIRCLE_ANGLE)

          
        this.rotateAngle = angle

        // 旋转结束后，允许再次触发
        setTimeout(() => {
          
          this.rotateOver()
        }, config.duration + 1000)
    },
    rotateOver () {
      this.isRotating = false

      this.prize = prizeList[this.index]
      this.addPrizeToOwnedList();
      console.log(this.prize, this.index)
    },
    //关闭弹窗
    closeToast() {
      this.prize = null;
      this.message = null;
    },
    //格式化当前时间戳
    timeFormat(time = + new Date()){
      var date = new Date(time + 8* 3600 * 1000);
      return date.toJSON().substr(0,19).replace('T',' '); //'2020-10-10 16:15:20'
    },
     //格式化当前日期
    dateFormat(){
      var date = this.timeFormat();
      return date.substr(0,10);
    },
    //获奖记录
    addPrizeToOwnedList(){
      var prize = {
        // id:-1,
        prizedTime1:this.timeFormat(),
      	prizeName: this.getPrizeName(),
        prizeLevel: this.prizeLevel,
        prizeUuid:utils.generateUUID(),
        userName:this.userName,
        groupName:'cindy'
        };
      this.ownedPrizeList.unshift(prize);
      //提交服务器
      this.submitPrizeTosever(prize)
    },
    submitPrizeTosever(prize){
      var params = {
          s: 'App.Table.Create',
          return_data:0,
          model_name:'prize',
          data:JSON.stringify(prize)
      };

    var that = this;
     this.$axios({
        method: 'post',
        url: yesapi.YESAPI_HOST,
        params : yesapi.encrypt(params)
      }).then(
       response => {
          console.log(response);
      }
      ).catch(function (error) {
          console.log(error);
      });
    },
    deletePrizeFromSeverById(prizeId){
      var params = {
          s: 'App.Table.Delete',
          return_data:0,
          model_name:'prize',
          id:prizeId,
      };

    var that = this;
     this.$axios({
        method: 'post',
        url: yesapi.YESAPI_HOST,
        params : yesapi.encrypt(params)
      }).then(
       response => {
          console.log(response);
      }
      ).catch(function (error) {
          console.log(error);
      });
    },
    //删除获奖记录
    deletePrizeFromOwnedList(desItem){
      this.ownedPrizeList.forEach((item,index)=>{
        if(item.id === desItem.id)
          this.ownedPrizeList.shift(item);
          console.log("deleted item.id = " + item.id)
          this.deletePrizeFromSeverById(item.id)
      })
    },
    // 判断是否可以抽奖
    checkRoateable(){
      //是否为管理员
      if(this.isAdmin()){
        this.message = 'Face,要face不要？\n管理员就不要来抽了嘛。\n～～！'
        return false;
      }
        
      // //判断是否在抽奖有效时段
      if(!this.checkPrizeLevelIsOnOrOff(this.prizeLevel)){
        this.message = '活动还没有开始得嘛。\n猛戳一哈管理员麻溜儿滴，～～！'
        return false;
      }

      //判断是否已有抽奖记录
      for(let item of this.ownedPrizeList){
        let date = this.dateFormat();
        if(item.prizedTime1.includes(date) && item.prizeLevel == this.prizeLevel){
          this.message = '抽过了就不要再来抽了嘛。\n～～！'
          return false;
        }
      }
      return true;
    },
    updateServerPrizeLevelController() {
      var params = {
          s: 'App.Table.Update',
          return_data:0,
          model_name:'prizeLevelController',
          id:this.prizeLevelController.id,
          data:JSON.stringify(this.prizeLevelController)
          // page:1,
          // perpage:10,
          // is_real_total:1
      };

    var that = this;
     this.$axios({
        method: 'post',
        url: yesapi.YESAPI_HOST,
        params : yesapi.encrypt(params)
      }).then(
       response => {
          console.log(response);
      }
      ).catch(function (error) {
          console.log(error);
      });
  },
  queryPrizeFromSever() {
      var strWhere = '[[\"groupName\", \"=\", \"cindy\"]]'
      if(!this.isAdmin()){
        strWhere = '[[\"groupName\", \"=\", \"cindy\"],[\"userName\", \"=\",' + '\"' + this.userName +'\"]]'
      }
  
      var params = {
          s: 'App.Table.FreeQuery',
          return_data:0,
          model_name:'prize',
          logic:'and',
          where: strWhere,
          page:1,
          perpage:1000,
          // is_real_total:1
          
      };
     this.$axios({
        method: 'get',
        url: yesapi.YESAPI_HOST,
        params : yesapi.encrypt(params)
      }).then(
       response => {
          console.log(response);
          this.ownedPrizeList = response.data.data.list
         
      }
      ).catch(function (error) {
          console.log(error);
      });

    },
    queryPrizeLevelController() {
      var params = {
          s: 'App.Table.FreeQuery',
          return_data:0,
          model_name:'prizeLevelController',
          logic:'and',
          where:'[[\"groupName\", \"=\", \"cindy\"]]',
      };
     this.$axios({
        method: 'get',
        url: yesapi.YESAPI_HOST,
        params : yesapi.encrypt(params)
      }).then(
       response => {
          console.log(response);
          this.prizeLevelController = response.data.data.list[0]
      }
      ).catch(function (error) {
          console.log(error);
      });

    }

  }

};
</script>
<style scoped>
.container {
  width: 100%;
}
.lucky-wheel {
  width: 100%;
  background: rgb(252, 207, 133) url("../assets/img/color_pillar.png") no-repeat
    center bottom;
  background-size: 100%;
  padding-top: 20px;
}
.lucky-title {
  width: 100%;
  height: 8.125rem;
  background: url("../assets/img/lucky_title.png") no-repeat center top;
  background-size: 100%;
}
.wheel-main {
  margin: 0 auto;
  position: relative;
  width: 295px;
  height: 295px;
}
.wheel-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background: url("../assets/img/draw_wheel.png") no-repeat center top;
  background-size: 100%;
  color: #fff;
}
.wheel-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 85px;
  height: 85px;
  background: url("../assets/img/draw_btn.png") no-repeat center top;
  background-size: 100%;
  transform: translate3d(-50%, -50%, 0);
}
.wheel-bg div {
  text-align: center;
}
.prize-list {
  width: 100%;
  height: 100%;
  position: relative;
}
.prize-list .prize-item {
  position: absolute;
  width: 95px;
  height: 150px;
  top: 0;
  left: 50%;
  margin-left: -47.5px;
  transform-origin: 50% 100%;
}

.prize-pic img {
  width: 4.0625rem;
  height: 2.5rem;
  margin-top: 1.5625rem;
}
.prize-count {
  font-size: 0.875rem;
}
.prize-type {
  font-size: 0.75rem;
}
.main {
  position: relative;
  width: 100%;
  min-height: 24.25rem;
  background: rgb(243, 109, 86);
  padding-bottom: 1.6875rem;
}
.main-bg {
  width: 100%;
  height: 6.5625rem;
  position: absolute;
  top: -3.4375rem;
  left: 0;
  background: url("../assets/img/luck_bg.png") no-repeat center top;
  background-size: 100%;
}
.bg-p {
  width: 100%;
  height: 2.95rem;
  background: rgb(252, 207, 133);
}
.content {
  position: absolute;
  top: 0.175rem;
  left: 0;
  background: rgb(243, 109, 86);
  width: 100%;
  height: 5.1875rem;
  font-size: 1.125rem;
  color: #ffeb39;
  padding-left: 6.75rem;
}
.content div {
  text-align: left;
}
.tip {
  position: relative;
  margin: 2.5rem auto 0;
  width: 17.5rem;
  border: 1px solid #fbc27f;
}
.tip-title {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translate(-50%, 0);
  font-size: 1rem;
  color: #fccc6e;
  background: rgb(243, 109, 86);
  padding: 0.3125rem 0.625rem;
  white-space: pre-wrap; /*保留空白并且正常换行*/
}
.tip-content {
  padding: 1.5625rem 0.625rem;
  font-size: 0.875rem;
  color: #fff8c5;
  line-height: 1.5;
}
.tip-prize-content {
  padding: 1.5625rem 0.625rem;
  font-size: 0.875rem;
  color: #fccc6e;
  line-height: 2.5;
}
.tip-prize-content2 {
  font-size: 1.275rem;
  color: #eb0b0b;
  line-height: 1.5;
}
.prize-controller {
  position: relative;
  margin: 1.5rem auto 0;
  width: 23.5rem;
  /* border: 1px solid #fbc27f; */
}
.prize-controller div{
  margin: 0.5rem;
}
.toast-mask {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  width: 100%;
  height: 100%;
}
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 20000;
  transform: translate(-50%, -50%);
  width: 15.4375rem;
  background: #fff;
  border-radius: 0.3125rem;
  padding: 0.3125rem;
  background-color: rgb(252, 244, 224);
}
.toast-container {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px dotted #fccc6e;
}
.toast-picture {
  position: absolute;
  top: -6.5rem;
  left: -1.5rem;
  width: 18.75rem;
  height: 8.5625rem;
}
.toast-pictrue-change {
  position: absolute;
  top: -1.5rem;
  left: -1.375rem;
  width: 17.5rem;
  height: 3.125rem;
}
.toast-title {
  padding: 2.8125rem 0;
  font-size: 18px;
  color: #fc7939;
  text-align: center;
  white-space: pre-wrap; /*保留空白并且正常换行*/
}
.toast-login-message {
  padding: 0.8125rem 0;
  font-size: 12px;
  color: #eb0b0b;
  text-align: center;
  white-space: pre-wrap; /*保留空白并且正常换行*/
}
.toast-login-title {
  padding: 0.8125rem 0;
  font-size: 18px;
  color: #fc7939;
  text-align: center;
  white-space: pre-wrap; /*保留空白并且正常换行*/
}
.toast-login-input {
  padding: 0.8125rem ;
  font-size: 18px;
  color: #fc7939;
  text-align: center;
  outline-style: none ;
  border-radius: 0.3125rem;
  /* padding: 0.3125rem; */
  border: 1px solid #fbc27f;
  margin-left: 0.5125rem;
  position: relative;
  width: 80%;
}
.toast-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.9375rem;
}
.toast-btn div {
  background-image: -moz-linear-gradient(
    -18deg,
    rgb(242, 148, 85) 0%,
    rgb(252, 124, 88) 51%,
    rgb(252, 124, 88) 99%
  );

  background-image: -ms-linear-gradient(
    -18deg,
    rgb(242, 148, 85) 0%,
    rgb(252, 124, 88) 51%,
    rgb(252, 124, 88) 99%
  );
  background-image: -webkit-linear-gradient(
    -18deg,
    rgb(242, 148, 85) 0%,
    rgb(252, 124, 88) 51%,
    rgb(252, 124, 88) 99%
  );
  box-shadow: 0px 4px 0px 0px rgba(174, 34, 5, 0.7);
  width: 4.6875rem;
  height: 1.875rem;
  border-radius: 1.875rem;
  text-align: center;
  line-height: 1.875rem;
  color: #fff;
}
.close {
  position: absolute;
  top: -0.9375rem;
  right: -0.9375rem;
  width: 2rem;
  height: 2rem;
  background: url("../assets/img/close_store.png") no-repeat center top;
  background-size: 100%;
}
.btn_start {
    font-size: 0.875rem;
    color: #fff8c5;
    line-height: 2.5;
    text-align: center;
    border-radius: 10%;
    background-color: #f00;
    cursor: pointer;
    -webkit-transition:all 0.7s linear;
    -moz-transition:all 0.7s linear;
    -ms-transition:all 0.7s linear;
    -o-transition:all 0.7s linear;
    transition:all 0.7s linear;
}

.btn_round_conner {
    font-size: 0.875rem;
    color: #fff8c5;
    line-height: 1.5;
    text-align: center;
    border-radius: 50%;
    background-color: #f00;
    cursor: pointer;
    /* position: absolute;
    right: 50px;
    bottom: 50px;
    z-index: 9; */
    /* color:#fff; */
    -webkit-transition:all 0.7s linear;
    -moz-transition:all 0.7s linear;
    -ms-transition:all 0.7s linear;
    -o-transition:all 0.7s linear;
    transition:all 0.7s linear;
}
/* .btn_round_conner:hover{
    background-color: darkorange;
    border-color: #fff;
} */
/* .btn_start{
    position: static;
    margin:25px auto 0 auto;
} */

@-webkit-keyframes glowing {
    from {
        -webkit-box-shadow: 0 0 0 rgba(255, 211, 0, 0.8);
        box-shadow: 0 0 0 rgb(255, 132, 1);
    }
    50% {
        -webkit-box-shadow: 0 0 20px rgba(219, 157, 12, 0.8);
        box-shadow: 0 0 20px rgba(219, 12, 15, 0.8);
    }
    to {
        -webkit-box-shadow: 0 0 0 rgba(219, 123, 25, 0.91);
        box-shadow: 0 0 0 rgb(219, 113, 33);
    }
}

@keyframes glowing {
    from {
        -webkit-box-shadow: 0 0 0 rgba(219, 97, 31, 0.3);
        box-shadow: 0 0 0 rgb(219, 78, 30);
    }
    50% {
        -webkit-box-shadow: 0 0 20px rgba(238, 133, 128, 0.8);
        box-shadow: 0 0 20px rgba(255, 211, 0, 0.8);
    }
    to {
        -webkit-box-shadow: 0 0 0 rgba(219, 78, 30, 0.3);
        box-shadow: 0 0 0 rgba(238, 133, 128, 0.3);
    }
}

.button-glow {
    -webkit-animation-duration: 3s;
    animation-duration: 3s;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
    -webkit-animation-name: glowing;
    animation-name: glowing;
}

#toggle-button{ 
        display: none; 
    }
    .button-label{
        position: relative;
        display: inline-block;
        width: 80px;
        background-color: #ccc;
        border: 1px solid #ccc;
        border-radius: 30px;
        cursor: pointer;
    }
    .circle{
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #fff;
    }
    .button-label .text {
        line-height: 30px;
        font-size: 18px;

        /*
        用来阻止页面文字被选中，出现蓝色
        可以将下面两行代码注释掉来查看区别
        */
       -webkit-user-select: none;
       user-select: none;
    }
    .on { 
        color: #fff; 
        display: none; 
        text-indent: 10px;
    }
    .off { 
        color: #fff; 
        display: inline-block; 
        text-indent: 53px;
    }
    .button-label .circle{
        left: 0;
        transition: all 0.3s;/*transition过度，时间为0.3秒*/
    }

    /*
    以下是checked被选中后，紧跟checked标签后面label的样式。
    例如：div+p 选择所有紧接着<div>元素之后的<p>元素
    */
    #toggle-button:checked + label.button-label .circle{
        left: 50px;
    }
    #toggle-button:checked + label.button-label .on{ 
        display: inline-block; 
    }
    #toggle-button:checked + label.button-label .off{ 
        display: none; 
    }
    #toggle-button:checked + label.button-label{
        background-color: #33FF66;
    }


</style>

