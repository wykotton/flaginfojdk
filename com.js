(function( window, undefined ) {
  var location = window.location,
  document = window.document,
  docElem = document.documentElement,
  core_version = "2.0.0";
  pfg = {
    init: function() {
      // console.log(this)
    },
    listenMsg: function(dom) {
      window.addEventListener('message', function(e) {
        if (dom && e.source != dom.contentWindow) return;
        if (e.data.status === 'finish') {
          const iframeContainer = window.document.getElementById('app-main')
          if (iframeContainer) {
            // iframeContainer.getElementsByClassName('iframe-container')[0].style.height = e.data.h + 'px'
            iframeContainer.classList.remove('loading')
          }
          return true
        }
      }, false);
    },
    sendMessage: function(frame, data) {
      console.log(frame, data)
      frame.postMessage(data, '*');
      // window.parent.postMessage(data,'*');
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
    }
  }
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = pfg;
  } else {
    if ( typeof define === "function" && define.amd ) {
      define( "pfg", [], function () { return pfg; } );
    }
  }
if ( typeof window === "object" && typeof window.document === "object" ) {
  window.pfg = pfg;
}
  pfg.init()
})( window );
