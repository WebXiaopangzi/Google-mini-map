$(function() {
  "use strict";

  function t(t, e, a, s) {
    var o = s || 5,
      i = "https://api.foursquare.com/v2/venues/search?client_id=HPTKFD3QU12Y0FPPQ0OVTZ51RFAYJ5L4104MNJJL0CW2HEEQ&client_secret=YLBK5PYZW4FZNK0QIQX5SCJOQS4TYYEHR2LZ2SHYGJLXJCLE&v=20130815&ll=" + t + "," + e + "&intent=checkin&radius=500&limit=" + o;
    return i += "&categoryId=4bf58dd8d48988d184941735,4bf58dd8d48988d1b4941735", i += "&query=" + encodeURIComponent(a)
  }

  function e(t, e) {
    var a = e || 5,
      s = "https://api.foursquare.com/v2/venues/" + t + "/photos?client_id=HPTKFD3QU12Y0FPPQ0OVTZ51RFAYJ5L4104MNJJL0CW2HEEQ&client_secret=YLBK5PYZW4FZNK0QIQX5SCJOQS4TYYEHR2LZ2SHYGJLXJCLE&v=20130815";
    return s += "&limit=" + a
  }

  function a(t) {
    var e = "http://api.nytimes.com/svc/search/v2/articlesearch.json?&api-key=5970e8422dc755c43539b1a554bd3017:18:34329006",
      a = 'news_desk:("Sports") AND body:("' + t + '")';
    return e += "&fq=" + encodeURIComponent(a)
  }

  function s(t) {
    return t.replace(/&#(\d+);/g, function(t, e) {
      return String.fromCharCode(e)
    })
  }
  var o = function(t) {
      this.name = ko.observable(t.name), this.lat = ko.observable(t.lat), this.lng = ko.observable(t.lng), this.visible = "boolean" == typeof t.visible ? ko.observable(t.visible) : ko.observable(!0), this.teams = ko.observableArray([]);
      for (var e = 0; e < t.teams.length; e++) this.teams.push({
        name: ko.observable(t.teams[e].name),
        league: ko.observable(t.teams[e].league)
      });
      this.foursquareid = ko.observable(null), this.foursquareid.extend({
        rateLimit: 50
      }), this.address = ko.observableArray([]), this.address.extend({
        rateLimit: 50
      }), this.photos = ko.observableArray([]), this.photos.extend({
        rateLimit: 50
      }), this.articles = ko.observableArray([]), this.articles.extend({
        rateLimit: 50
      }), this.mapPoint = ko.computed(function() {
        return {
          lat: this.lat(),
          lng: this.lng()
        }
      }, this), this.icon = ko.computed(function() {
        var t, e = "multi";
        return this.teams() && 1 == this.teams().length && (e = this.teams()[0].league().toLowerCase()), t = "img/" + e + "-marker.png", {
          anchor: new google.maps.Point(12, 12),
          url: t
        }
      }, this), this.marker = ko.observable(new google.maps.Marker({
        position: this.mapPoint(),
        title: this.name(),
        icon: this.icon()
      })), this.searchString = ko.computed(function() {
        for (var t = this.name(), e = 0; e < this.teams().length; e++) t += " " + this.teams()[e].name();
        return t.toUpperCase()
      }, this), this.inLeagues = ko.computed(function() {
        for (var t = [], e = 0; e < this.teams().length; e++) t.push(this.teams()[e].league());
        return t
      }, this)
    },
    i = function(t) {
      this.league = ko.observable(t.league), this.display = ko.observable(t.display), this.imageSrc = ko.computed(function() {
        var t, e = "img/";
        return t = this.display() ? this.league().toLowerCase() + ".png" : this.league().toLowerCase() + "-off.png", e + t
      }, this), this.hover = ko.computed(function() {
        var t = this.display() ? "Hide " : "Show ";
        return t += this.league() + " Stadiums";
      }, this)
    },
    n = {
      gettingNYTimesData: !1,
      gettingFoursquareData: !1,
      gettingFoursquarePhotos: !1,
      isGettingData: function() {
        return this.gettingNYTimesData || this.gettingFoursquareData || this.gettingFoursquarePhotos
      },
      getRemoteData: function(t, e) {
        console.log("Get remote data"), e.gettingdata(this.isGettingData()), e.errors([]), null === t.foursquareid() && this.getFoursquareData(t, e), 0 === t.articles().length && this.getNYTimesData(t, e)
      },
      getFoursquareData: function(e, a) {
        var s = this;
        s.gettingFoursquareData || (s.gettingFoursquareData = !0, a.gettingdata(s.isGettingData()), $.ajax({
          dataType: "json",
          url: t(e.lat(), e.lng(), e.name()),
          success: function(t) {
            console.log("Got 4sq data");
            var o, i;
            if (i = t.response.venues[0], 0 === e.address.length)
              for (o in i.location.formattedAddress) e.address.push(i.location.formattedAddress[o]);
            e.foursquareid(i.id), s.gettingFoursquareData = !1, a.gettingdata(s.isGettingData()), 0 === e.photos().length && s.getFoursquarePhotos(e, a)
          },
          error: function() {
            console.log("Error getting foursquare data"), s.gettingFoursquareData = !1, a.errors.push("Error getting Foursquare data"), a.gettingdata(s.isGettingData())
          }
        }))
      },
      getFoursquarePhotos: function(t, a) {
        var s = this;
        s.gettingFoursquarePhotos || (console.log("getting photos"), s.gettingFoursquarePhotos = !0, a.gettingdata(s.isGettingData()), $.ajax({
          dataType: "json",
          url: e(t.foursquareid()),
          success: function(e) {
            console.log("got photos");
            var o = e.response.photos.items;
            if (0 === t.photos.length)
              for (var i in o) {
                var n = o[i].prefix + "cap300" + o[i].suffix;
                t.photos.push(n)
              }
            s.gettingFoursquarePhotos = !1, a.gettingdata(s.isGettingData())
          },
          error: function(t, e, o) {
            console.log("Error getting photos"), s.gettingFoursquarePhotos = !1, a.errors.push("Error getting Foursquare photos"), a.gettingdata(s.isGettingData())
          }
        }))
      },
      getNYTimesData: function(t, e) {
        var o = this;
        o.gettingNYTimesData || (o.gettingNYTimesData = !0, e.gettingdata(o.isGettingData()), $.ajax({
          dataType: "json",
          url: a(t.name()),
          success: function(a) {
            var i;
            if ("OK" === a.status && 0 === t.articles.length) {
              i = a.response.docs;
              for (var n in i) t.articles.push({
                url: i[n].web_url,
                headline: s(i[n].headline.main)
              });
              console.log("Got NY Times articles")
            } else console.log("Error getting NY Times articles"), e.errors.push("Error getting NY Times articles");
            o.gettingNYTimesData = !1, e.gettingdata(o.isGettingData())
          },
          error: function(t, a, s) {
            console.log("Error getting NY Times articles"), o.gettingNYTimesData = !1, e.errors.push("Error getting NY Times articles"), e.gettingdata(o.isGettingData())
          }
        }))
      },
      reset: function() {
        this.gettingNYTimesData = !1, this.gettingFoursquareData = !1, this.gettingFoursquarePhotos = !1
      }
    },
    r = function() {
      var t, e, a = this,
        s = [];
      a.map = null, a.infowindow = null, a.datastatus = ko.observable({
        gettingdata: ko.observable(!0),
        errors: ko.observableArray([])
      }), a.searchtext = ko.observable(""), a.searchtext.extend({
        rateLimit: {
          timeout: 400,
          method: "notifyWhenChangesStop"
        }
      }), a.clearSearchText = function() {
        this.searchtext("")
      }, a.filters = ko.observableArray([]), a.emptysearch = ko.observable(!1), a.stadiums = ko.observableArray([]), a.stadiums.extend({
        rateLimit: {
          timeout: 20,
          method: "notifyWhenChangesStop"
        }
      }), e = stadiumData.sort(function(t, e) {
        var a = t.name.toUpperCase(),
          s = e.name.toUpperCase();
        return a < s ? -1 : a > s ? 1 : 0
      });
      for (var r in e) {
        a.stadiums.push(new o(stadiumData[r]));
        for (var u = 0; u < stadiumData[r].teams.length; u++) {
          var d = stadiumData[r].teams[u];
          s.indexOf(d.league) < 0 && s.push(d.league)
        }
      }
      a.selectedStadium = ko.observable(null), a.selectedStadium.extend({
        rateLimit: {
          timeout: 10,
          method: "notifyWhenChangesStop"
        }
      }), a.showMarker = function(t) {
        a.toggleMenu(!1), n.reset(), t.marker().setAnimation(google.maps.Animation.BOUNCE), window.setTimeout(function() {
          t.marker().setAnimation(null)
        }, 2e3), a.selectedStadium(t), n.getRemoteData(t, a.datastatus())
      }, a.toggleMenu = function(t) {
        $("#stad-list-hideable").toggleClass("stad-menu-offsmall", "undefined" == typeof t ? t : !t), $("#stad-list-menu-toggle .fa").toggleClass("fa-caret-down", "undefined" == typeof t ? t : !t), $("#stad-list-menu-toggle .fa").toggleClass("fa-caret-up", t)
      }, a.toggleFilter = function(t) {
        t.display(!t.display())
      }, a.filterList = function() {
        var t, e, s = a.searchtext().toUpperCase().trim(),
          o = s.split(/\s+/),
          i = [],
          n = !0;
        for (var r in a.filters()) a.filters()[r].display() && i.push(a.filters()[r].league());
        null === a.selectedStadium() || l(a.selectedStadium(), o, i) || (a.selectedStadium(null), console.log("Setting stadium to null"));
        for (var u = 0; u < a.stadiums().length; u++) t = a.stadiums()[u], e = l(t, o, i), t.visible(e), n && e && (n = !1);
        a.stadiums.valueHasMutated(), a.emptysearch(n), g(".stad-list-ul", "stad-list-last")
      }, a.searchtext.subscribe(a.filterList);
      for (var m = 0; m < s.length; m++) t = new i({
        league: s[m],
        display: !0
      }), t.display.subscribe(a.filterList), a.filters.push(t)
    },
    l = function(t, e, a) {
      var s = !1;
      if (u(t, a))
        for (var o = 0; o < e.length; o++)
          if (t.searchString().indexOf(e[o]) >= 0) {
            s = !0;
            break
          }
      return s
    },
    u = function(t, e) {
      var a = !1,
        s = t.inLeagues();
      for (var o in s)
        if (e.indexOf(s[o]) >= 0) {
          a = !0;
          break
        }
      return a
    },
    g = function(t, e) {
      $("." + e).removeClass(e), $(t).children().filter(":visible:last").addClass(e)
    };
  ko.bindingHandlers.googlemap = {
    init: function(t, e, a, s, o) {
      var i = {
          zoom: 4,
          center: {
            lat: 39.8282,
            lng: -98.5795
          },
          disableDefaultUI: !0,
          scrollwheel: !1,
          zoomControl: !0,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        },
        n = o.$data;
      n.map = new google.maps.Map(t, i), google.maps.event.addListenerOnce(n.map, "tilesloaded", function(t) {
        console.log("adding event listener");
        var e = document.createElement("div");
        e.id = "stadium-list-control";
        var a = $("#stadium-list").detach();
        n.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(e), a.appendTo("#stadium-list-control"), $("#stad-list-menu-toggle").click(function() {
          n.toggleMenu()
        })
      })
    },
    update: function(t, e, a, s, o) {
      function i(t, e, a) {
        google.maps.event.clearListeners(t, "click"), google.maps.event.addListener(t, "click", function() {
          a.showMarker(e)
        })
      }
      var n = e,
        r = o.$data;
      console.log("Calling update on map");
      for (var l in n().stadiums()) {
        var u = n().stadiums()[l];
        u.visible.peek() ? (u.marker().setMap(r.map), i(u.marker(), u, r)) : (u.marker().setMap(null), console.log("Removing from map"))
      }
    }
  }, ko.bindingHandlers.infowindow = {
    init: function(t, e, a, s, o) {
      var i = o.$data;
      i.infowindow = new google.maps.InfoWindow({
        content: '<div id="info-window"></div>'
      })
    },
    update: function(t, e, a, s, o) {
      function i(t) {
        google.maps.event.addListener(t, "domready", function() {
          var t = $("#selected-stadium-info").html();
          $("#info-window").html(t)
        })
      }
      console.log("Update info window");
      var n = o.$data,
        r = n.infowindow,
        l = e().stadium();
      e().messages();
      if (r.close(), null !== l) {
        r.open(n.map, l.marker()), i(r);
        e().messages().gettingdata(), e().messages().errors(), e().stadium().photos(), e().stadium().address(), e().stadium().articles()
      } else console.log("Stadium is null")
    }
  }, "undefined" != typeof google ? ko.applyBindings(new r) : (console.log("Error loading Google Maps API"), $(".map-canvas").hide(), $("body").prepend('<div class="error-dialog"><p class="error-message">There was an error loading Google Maps. Please check your internet connection or try again later.</p></div>'))
});
