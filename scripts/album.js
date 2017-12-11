var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">' +
    '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
    '  <td class="song-item-title">' + songName + '</td>' +
    '  <td class="song-item-duration">' + songLength + '</td>' +
    '</tr>';

  var $row = $(template);
  var clickHandler = function() {
    // clickHandler logic
    var songNumber = parseInt($(this).attr('data-song-number'));

    if (currentlyPlayingSongNumber !== null) {
      // Revert to song number for currently playing song because user started playing new song.
      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
      isPlaying = false;
    }

    if (currentlyPlayingSongNumber !== songNumber) {
      // Switch from Play -> Pause button to indicate new song is playing.
      setSong(songNumber);
      currentSoundFile.play();

      setInitialSeekBar();

      $(this).html(pauseButtonTemplate);

      updatePlayerBarSong();
      isPlaying = true;
    } else if (currentlyPlayingSongNumber === songNumber) {
      if (currentSoundFile.isPaused()) {
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
      } else {
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentSoundFile.pause();
      }
      isPlaying = false;
    }
  };

  var onHover = function(event) {
    // Placeholder for function logic
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt($(this).attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };
  var offHover = function(event) {
    // Placeholder for function logic
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt($(this).attr('data-song-number'));
    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(songNumber);
    }
  };

  // #1
  $row.find('.song-item-number').click(clickHandler);
  // #2
  $row.hover(onHover, offHover);
  // #3
  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  // #1
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');
  // #2
  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);


  // #3
  $albumSongList.empty();

  // #4
  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};


var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Note that we're _incrementing_ the song here
  currentSongIndex++;

  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }

  // Save the last song number before changing it
  var lastSongNumber = currentlyPlayingSongNumber;

  // Set a new current song
  setSong(currentSongIndex + 1);

  currentSoundFile.play();

  // Update the Player Bar information
  updatePlayerBarSong();

  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

  setInitialSeekBar();

  isPlaying = true;
};

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Note that we're _decrementing_ the index here
  currentSongIndex--;

  if (currentSongIndex < 0) {
    currentSongIndex = currentAlbum.songs.length - 1;
  }

  // Save the last song number before changing it
  var lastSongNumber = currentlyPlayingSongNumber;

  // Set a new current song
  setSong(currentSongIndex + 1);

  currentSoundFile.play();

  // Update the Player Bar information
  updatePlayerBarSong();

  $('.main-controls .play-pause').html(playerBarPauseButton);

  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

  setInitialSeekBar();

  isPlaying = false;
};

var togglePlayFromPlayerBar = function() {

  var $CurrentSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber)
  if(isPlaying)
  {
    //click to switch to pause
    $('.main-controls .play-pause').html(playerBarPlayButton);
    $CurrentSongNumberCell.html(playButtonTemplate);
    currentSoundFile.pause();
  }
  else
  {
    $('.main-controls .play-pause').html(playerBarPauseButton);
    $CurrentSongNumberCell.html(pauseButtonTemplate);
    currentSoundFile.play();
  }
  isPlaying = !isPlaying;

};

var updatePlayerBarSong = function() {

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);

};

var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = songNumber;
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    // #2
    formats: ['mp3'],
    preload: true
  });

  setVolume(currentVolume);
}

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
}

var setVolume = function(volume) {
  if (currentSoundFile) {
      currentSoundFile.setVolume(volume);
  }
}

var setupSeekBars = function () {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function (event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($(this).parent().attr('class') == 'seek-control') {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio * 100);
    }

    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function (event) {
    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function (event) {
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if ($seekBar.parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio);
      }

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  });
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
      // #10
      currentSoundFile.bind('timeupdate', function(event) {
          // #11
          var seekBarFillRatio = this.getTime() / this.getDuration();
          var $seekBar = $('.seek-control .seek-bar');

          updateSeekPercentage($seekBar, seekBarFillRatio);
      });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  // #1
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  // #2
  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var seek = function(time) {
  if (currentSoundFile) {
      currentSoundFile.setTime(time);
  }
}

var setInitialSeekBar = function()
{
  updateSeekBarWhileSongPlays();
  var $volumeFill = $('.volume .fill');
  var $volumeThumb = $('.volume .thumb');
  $volumeFill.width(currentVolume + '%');
  $volumeThumb.css({left: currentVolume + '%'});
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
// Store state of playing songs

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

var currentVolume = 80;

var isPlaying = false;

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerBar);
});
