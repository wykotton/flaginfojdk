(function(window, undefined) {
  var location = window.location,
  document = window.document,
  docElem = document.documentElement,
  document.body.style.display = 'none',
  core_version = "2.0.0";
  fg = (function(window){
      return {
        init: function() {
          var initOption = {
            chalk: '',
            theme: 'default',
            color: '#409EFF'
          }
          this.__proto__ = Object.assign(this.__proto__, initOption)
          this.sendMessage({status: 'finish', h: document.body.scrollHeight})
          this.listenMsg()
          this.loadTheme()
        },
        listenMsg: function(dom, callback) {
          var _this = this
          window.addEventListener('message', function(e) {
            // if (dom && e.source != dom.contentWindow) return;
            // console.log(e.data)
            if (e.data.token) {
              // console.log(e.data.token)
              _this.cookie.set('Admin-Token', e.data.token)
              if (typeof callback === 'function') {
                callback()
              }
              return true
            }
          }, false);
        },
        sendMessage: function(data) {
          // window.frames[0].postMessage('getcolor','http://fg.my.com');
          window.parent.postMessage(data,'*');
        },
        cookie: {
          set: function (name, value, days) {
            let d = new Date();
            let hostname = window.location.hostname
            let hostArr = hostname.split('.')
            let domain = hostArr.length < 3 ? hostname : (hostArr.splice(0, 1), hostArr.join('.'))
            d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
            window.document.cookie = name + '=' + value + ';path=/;domain=' + domain + ';expires=' + d.toGMTString();
          },
          get: function (name) {
            let v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : null;
          },
          delete: function (name) {
            this.set(name, '', -1);
          }
        },
        loadTheme: function() {
          var reqTheme = this.getQueryObject().theme
          var reqColor = this.getQueryObject().color
          // 设置主题
          if (reqTheme) this.theme = reqTheme
          // if (reqColor) this.color = reqColor
          var link = document.createElement('link');
          link.rel='stylesheet';
          link.type='text/css';
          link.href = '/static/theme/' + this.theme + '/index.css';
          var href = document.getElementsByTagName('head')[0];
          document.head.appendChild(link)
          // 设置颜色
          if (reqColor && reqColor !== this.color){
            this.setColor(reqColor, this.color)
          } else {
            document.body.style.display = 'block'
          }
        },
        setColor: function(val, oldVal) {
          if (typeof val !== 'string') return
          var themeCluster = this.getThemeCluster(val.replace('#', ''))
          var originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
          var _this = this
          var getHandler = function(variable, id) {
            return function() {
              var originalCluster = _this.getThemeCluster(_this.color.replace('#', ''))
              var newStyle = _this.updateStyle(_this[variable], originalCluster, themeCluster)

              let styleTag = document.getElementById(id)
              if (!styleTag) {
                styleTag = document.createElement('style')
                styleTag.setAttribute('id', id)
                document.head.appendChild(styleTag)
              }
              styleTag.innerText = newStyle
            }
          }

          var chalkHandler = getHandler('chalk', 'chalk-style')
          var version = this.getQueryObject().v
          if (!this.chalk) {
            var url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
            this.getCSSString(url, chalkHandler, 'chalk')
          } else {
            chalkHandler()
          }

          var styles = [].slice.call(document.querySelectorAll('style'))
            .filter(function(style) {
              var text = style.innerText
              return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
            })
          styles.forEach(function(style) {
            var { innerText } = style
            if (typeof innerText !== 'string') return
            style.innerText = _this.updateStyle(innerText, originalCluster, themeCluster)
          })
        },
        updateStyle: function(style, oldCluster, newCluster) {
          let newStyle = style
          oldCluster.forEach(function(color, index) {
            newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
          })
          return newStyle
        },

        getCSSString: function(url, callback, variable) {
          var xhr = new XMLHttpRequest()
          var _this = this
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
              _this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
              callback()
              document.body.style.display = 'block'
            }
          }
          xhr.open('GET', url)
          xhr.send()
        },

        getThemeCluster: function(theme) {
          var tintColor = function(color, tint) {
            let red = parseInt(color.slice(0, 2), 16)
            let green = parseInt(color.slice(2, 4), 16)
            let blue = parseInt(color.slice(4, 6), 16)

            if (tint === 0) { // when primary color is in its rgb space
              return [red, green, blue].join(',')
            } else {
              red += Math.round(tint * (255 - red))
              green += Math.round(tint * (255 - green))
              blue += Math.round(tint * (255 - blue))

              red = red.toString(16)
              green = green.toString(16)
              blue = blue.toString(16)

              return `#${red}${green}${blue}`
            }
          }

          var shadeColor = function(color, shade) {
            let red = parseInt(color.slice(0, 2), 16)
            let green = parseInt(color.slice(2, 4), 16)
            let blue = parseInt(color.slice(4, 6), 16)

            red = Math.round((1 - shade) * red)
            green = Math.round((1 - shade) * green)
            blue = Math.round((1 - shade) * blue)

            red = red.toString(16)
            green = green.toString(16)
            blue = blue.toString(16)

            return `#${red}${green}${blue}`
          }

          var clusters = [theme]
          for (let i = 0; i <= 9; i++) {
            clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
          }
          clusters.push(shadeColor(theme, 0.1))
          return clusters
        },
        getQueryObject: function(url) {
          url = url == null ? window.location.href : url
          var search = url.substring(url.lastIndexOf('?') + 1)
          var obj = {}
          var reg = /([^?&=]+)=([^?&=]*)/g
          search.replace(reg, function(rs, $1, $2) {
            var name = decodeURIComponent($1)
            let val = decodeURIComponent($2)
            val = String(val)
            obj[name] = val
            return rs
          })
          return obj
        }
      }
    })(window)
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = fg;
  } else {
    if ( typeof define === "function" && define.amd ) {
      define( "fg", [], function () { return fg; } );
    }
  }
  if ( typeof window === "object" && typeof window.document === "object" ) {
    window.fg = fg;
  }
  window.onload=function(e){
    fg.init()
  }
})(window);
