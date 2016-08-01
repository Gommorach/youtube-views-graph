$(document).ready(function () {
  var key;
  var playlistId;
  var playlistUrl;
  var reverse;
  var playlistTitle;

  var drawGraph = function (statistics) {
    var views = [];
    var episodeNumber = []
    for (var i = 0; i < statistics.length; i++) {
      views.push(parseInt(statistics[i].statistics.viewCount));
      episodeNumber.push(i + 1);
    }
    views = reverse ? views.reverse() : views;
    var color = 'rgba(255, 99, 132, 0.8)';
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: episodeNumber,
            datasets: [{
              backgroundColor: 'rgba(75, 179, 214, 0.5)',
                label: '#number of views: ',
                data: views
            }]
        },
        options: {
          scales: { yAxes: [{ ticks: { beginAtZero:false }}]},
          responsive: false,
          title: {
            display: true,
            fontSize: 24,
            fontStyle: 'bold',
            text: playlistTitle
          }
        }
      });
  }

  var getViewsByIds = function(ids, statistics) {
    var videosUrl = 'https://www.googleapis.com/youtube/v3/videos?part=statistics%2csnippet&id=';
    var numberOfIds = ids.length <= 50? ids.length: 50;
    for (var i = 0; i < numberOfIds; i++) {
      videosUrl += ids.shift() + '%2C';
    }
    videosUrl = videosUrl.substring(0, videosUrl.length - 3) + '&key=' + key;
    $.ajax({
      url: videosUrl
    }).done(function (data) {
      for (var i = 0; i < data.items.length; i++) {
        statistics.push(data.items[i]);
      }
      if (ids <= 0) {
        drawGraph(statistics);
      } else {
        getViewsByIds(ids, statistics);
      }
    });
  }

  var getIds = function (url, collectedIds, nextPageToken) {
    $.ajax({
      url: url + '&pageToken=' + nextPageToken
    }).done(function (data) {
      var totalIds = data.pageInfo.totalResults;
      for (var i = 0; i < data.items.length; i++) {
        collectedIds.push(data.items[i].snippet.resourceId.videoId);
      }
      if(collectedIds.length >= totalIds) { //done
        getViewsByIds(collectedIds, []);
      } else {
        var nextPageToken = data.nextPageToken;
        getIds(url, collectedIds, nextPageToken);
      }
    });
  }

  $('#drawGraph').on('click', function() {
    key = $('#key').val();
    playlistId = $('#playlistId').val();
    playlistUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&'
      + 'playlistId=' + playlistId
      + '&key=' + key;
    reverse = $('#reverse').is(':checked');
    $.ajax({
      url: 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' + playlistId + '&key=' + key
    }).done(function (data) {
        playlistTitle = data.items[0].snippet.title
        getIds(playlistUrl, [], '');
    });
  });
});
