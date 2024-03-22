const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER"

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const timeLeft = $(".time-left");
const timeRight = $(".time-right");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const checkbox = $("#themeSwitch");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const volume = $("#volume");

document.addEventListener('DOMContentLoaded', function() {
        // Mã JavaScript của bạn sẽ được đặt ở đây
        const btnOptions = document.querySelectorAll('.option');
    
        btnOptions.forEach(btnOption => {
            btnOption.addEventListener('click', function() {
               document.querySelector('option.active').classList.remove('active')
               btnOption.classList.toggle('active')
            });
        });
    });

/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ paurse/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random
 * 7. Next/ Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const app ={
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: {},
    songs: [
        {
            name: 'Heat waves',
            path: './css/audio/music-1.mp3',
            image: './css/img/thumb-2.jpg',
            singer: "Glass Animals",
            backgroundImage: ""

        },
        {
            name: 'Let her go',
            path: './css/audio/music-2.mp3',
            image: './css/img/thumb-3.jpg',
            singer: "Passenger",
            backgroundImage: ""

        },
        {
            name: 'Past lives',
            path: './css/audio/music-3.mp3',
            image: './css/img/thumb-4.jpg',
            singer: "sapientdream",
            backgroundImage: ""

        },
        {
            name: 'Death bed',
            path: './css/audio/music-4.mp3',
            image: './css/img/thumb-5.jpg',
            singer: "Powfu",
            backgroundImage: ""

        },
        {
          name: "We don't talk any more",
          path: './css/audio/music-5.mp3',
          image: './css/img/thumb-6.jpg',
          singer: "Charlie Puth (feat. Selena Gomez)",
          backgroundImage: ""   
      },
      {
          name: 'Past lives',
          path: './css/audio/music-3.mp3',
          image: './css/img/thumb-4.jpg',
          singer: "sapientdream",
          backgroundImage: ""
      },


    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) =>
        {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
              }" data-index="${index}">
                  <div class="thumb"
                      style="background-image: url('${song.image}')">
                  </div>
                  <div class="body">
                      <h3 class="title">${song.name}</h3>
                      <p class="author">${song.singer}</p>
                  </div>
                  <div class="option">
                      <i class="fas fa-ellipsis-h"></i>
                  </div>
              </div>
          `;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //When CD spins/ stops
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotage(360deg)"}],
        {
            duration : 10000, //10 seconds
            iterations : Infinity,
        });
        cdThumbAnimate.pause();

        //Handles CD enlargement / reduction
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };
        
        //Handle when click play 
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        //When a song is played
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play()
        };

        //When a song is paused
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause()
        };

        // Load song timeline
        audio.addEventListener("loadedmetadata", function(){
            timeRight.textContent = formatTime(audio.duration); 
        });

        // When the song progress changes
        audio.addEventListener("timeupdate", function() {
            const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
            progress.value = progressPercent;

            const timeChange = audio.currentTime;
            timeLeft.textContent = formatTime(timeChange);
        });

        // Seek
        progress.addEventListener("input", function() {
            const seekTime = (audio.duration / 100) * progress.value;
            audio.currentTime = seekTime;
        });

        // Function to format time in minutes:seconds
        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
            return formattedTime;
        }


        //When next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()
        };

        //When previous song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()
        };

        //Handle when random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Single-parallel repeat processing
        repeatBtn.onclick = function(e) {
            _this.isRepeat =!_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        //Handle next song when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                _this.nextSong();
            } else {
                _this.nextSong();
            }
        };

        //Listen to playlist changes
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
      
            if (songNode || e.target.closest(".option")) {
              // Xử lý khi click vào song
              // Handle when clicking on the song
              if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
              }
      
              // Xử lý khi click vào song option
              // Handle when clicking on the song option
              if (e.target.closest(".option")) {
              }
            }
          };
          window.addEventListener("DOMContentLoaded", function(){
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                document.body.classList.add(savedTheme);
                checkbox.checked = savedTheme === "dark";
            }
          })


    },
    scrollActiveSong: function() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }, 300);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
          this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
    
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        // Assign configuration from config to application
        this.loadConfig();
    
        // Định nghĩa các thuộc tính cho object
        // Defines properties for the object
        this.defineProperties();
    
        // Lắng nghe / xử lý các sự kiện (DOM events)
        // Listening / handling events (DOM events)
        this.handleEvents();
    
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        // Load the first song information into the UI when running the app
        this.loadCurrentSong();
    
        // Render playlist
        this.render();
    
        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};
app.start()