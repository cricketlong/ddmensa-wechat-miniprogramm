//index.js
const app = getApp()


Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    takeSession: false,
    requestResult: '',
    loadingCanteens: true,
    loggingIn: false
  },

  onLoad: function() {
    var thisPage = this;
    this.checkLoginStatus();
    wx.vrequest({
      url: app.globalData.apiBaseUrl + '/canteens',
      success: function(res) {
        var date = new Date();
        var y = date.getFullYear(); // year
        var m = date.getMonth() + 1; //month
        if (m < 10) {
          m = "0" + m;
        }
        var d = date.getDate(); //day
        if (d < 10) {
          d = "0" + d;
        }

        thisPage.setData({
          today: y + "-" + m + "-" + d,
          canteens: thisPage.saveAllCanteens(JSON.parse(res.data)),
          stickCanteenButtons: [{
            type: "primary",
            text: "置顶食堂"
          }],
          unstickCanteenButtons: [{
            type: "warn",
            text: "取消置顶"
          }],
          loadingCanteens: false
        });
      }
    });
  },

  getAllCanteens: function() {
    return wx.getStorageSync("canteens");
  },

  getFavoriteCanteenIndex: function(canteenId) {
    var allCanteens = this.getAllCanteens();
    if (allCanteens && allCanteens["favorite"]) {
      for (var i in allCanteens["favorite"]) {
        if (allCanteens["favorite"][i].id == canteenId) {
          return i;
        }
      }
    }

    return -1;
  },

  getNormalCanteenIndex: function(canteenId) {
    var allCanteens = this.getAllCanteens();
    if (allCanteens && allCanteens["normal"]) {
      for (var i in allCanteens["normal"]) {
        if (allCanteens["normal"][i].id == canteenId) {
          return i;
        }
      }
    }

    return -1;
  },

  saveAllCanteens: function(canteens) {
    if (!wx.getStorageSync("canteens")) {
      wx.setStorage({
        key: "canteens",
        data: {
          "favorite": [],
          "normal": this.sortCanteens(canteens)
        }
      })
    }

    return this.getAllCanteens();
  },

  savefavoriteCanteen: function(e) {
    var canteenId = e.detail.slideItemData;
    var iFavorite = this.getFavoriteCanteenIndex(canteenId);
    var iNormal = this.getNormalCanteenIndex(canteenId);
    if ((iFavorite < 0) && (iNormal >= 0)) {
      var allCanteens = this.getAllCanteens();
      var fCanteens = allCanteens["favorite"];
      var nCanteens = allCanteens["normal"];
      fCanteens.push(allCanteens["normal"][iNormal]);
      nCanteens.splice(iNormal, 1);

      // sort canteens
      this.sortCanteens(fCanteens);
      this.sortCanteens(nCanteens);

      wx.setStorageSync("canteens", allCanteens);
      this.setData({
        canteens: allCanteens
      });
    }
  },

  removefavoriteCanteen: function(e) {
    var canteenId = e.detail.slideItemData;
    var iFavorite = this.getFavoriteCanteenIndex(canteenId);
    var iNormal = this.getNormalCanteenIndex(canteenId);
    if ((iFavorite >= 0) && (iNormal < 0)) {
      var allCanteens = this.getAllCanteens();
      var fCanteens = allCanteens["favorite"];
      var nCanteens = allCanteens["normal"];
      nCanteens.push(allCanteens["favorite"][iFavorite]);
      fCanteens.splice(iFavorite, 1);

      // sort canteens
      this.sortCanteens(fCanteens);
      this.sortCanteens(nCanteens);

      wx.setStorageSync("canteens", allCanteens);
      this.setData({
        canteens: allCanteens
      });
    }
  },

  sortCanteens: function(canteens) {
    return canteens.sort((a, b) => a.name.localeCompare(b.name));
  },

  login: function() {
    this.setData({loggingIn: true});

    var thisPage = this;
    wx.getUserInfo({
      success: function(res) {
        wx.setStorage({
          key: 'userInfo',
          data: res.userInfo
        });

        thisPage.setData({
          loggedIn: true,
          userInfo: res.userInfo,
          loggingIn: false
        });
      }
    })
  },

  checkLoginStatus: function(e) {
    var loggedIn = false;
    var userInfo = wx.getStorageSync("userInfo");

    if (userInfo) {
      loggedIn = true;
    }

    this.setData({
      loggedIn: loggedIn,
      userInfo: userInfo
    })
  },

  logout: function(e) {
    var thisPage = this;
    wx.showModal({
      title: '提示',
      content: '您确定要退出登录吗？',
      success: function(e) {
        if (e.confirm) {
          // 删除用户登录信息
          wx.removeStorage({
            key: 'userInfo'
          })

          // 修改登录状态
          thisPage.setData({
            loggedIn: false
          });
        }
      }
    });
  }

})