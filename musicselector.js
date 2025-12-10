
const readButton = document.getElementById('Reading');
const mathButton = document.getElementById('Math');
const writeButton = document.getElementById('Writing');
const memorizationButton = document.getElementById('Memorization');
const relaxButton = document.getElementById('Relax');
const confirmButton = document.getElementById('confirmtime')
const generateButton = document.getElementById("generateplaylist");
const playPauseButton = document.getElementById('playpause');
const forwardButton = document.getElementById('forward');
const backwardButton = document.getElementById('backward');
const shuffleButton = document.getElementById('shuffle');
const volumeSlider = document.getElementById('volumeSlider');
//progress bar used for audio progress tracking
const progressBar = document.getElementById('progressBar');
const progressBarWrapper = document.getElementById('progressBarWrapper');
const currentTimeDisplay = document.getElementById('currentTime');
const durationTimeDisplay = document.getElementById('totalTime');

let categoryselected;
let limit = 20;
let buttonselected = false;
let currentplaylist = [];
let currentindex = 0;
let audioload = false;
let studySeconds = 0;
let studyTimerInterval = null;
//need to find a way to figure how long audio preview is and fit into progressbar
let audio =  new Audio();

const MODE_QUERIES = {
  reading: [
    "ambient+music",
    "lofi+ambient",
    "minimal+piano",
    "soft+instrumental",
    "calm+instrumental",
    "study+beats",
    "new+age+instrumental",
    "soft+electronic",
    "relaxing+soundtrack",
    "instrumental+acoustic"
  ],

  writing: [
    "lofi+beats",
    "lofi+study",
    "chillhop",
    "instrumental+beats",
    "downtempo+music",
    "lofi+hiphop",
    "electronic+instrumental",
    "chill+beats",
    "focus+beats",
    "jazzy+lofi"
  ],

  math: [
    "classical+instrumental",
    "piano+solo",
    "piano+instrumental",
    "string+quartet",
    "baroque+instrumental",
    "orchestral+instrumental",
    "minimalist+piano",
    "chopin",
    "mozart",
    "beethoven+piano",
    "film+score+instrumental"
  ],

  memory: [
    "baroque+music",
    "vivaldi",
    "bach+instrumental",
    "focus+classical",
    "string+ensemble",
    "harpsichord+instrumental",
    "baroque+orchestra",
    "study+classical"
  ],

  relax: [
    "sleep+music",
    "meditation+music",
    "deep+focus",
    "relaxing+instrumental",
    "ambient+sleep",
    "healing+music",
    "calm+piano",
    "chill+ambient",
    "relaxing+soundtrack",
    "yoga+music"
  ]
};

let playlistTitle = document.getElementById("titledisplay");
let songsList = document.getElementById("songs");
const timehour = document.getElementById("input-time-hour");
const timemin = document.getElementById("input-time-min");
const modeButtons = [readButton, mathButton, writeButton, memorizationButton, relaxButton];


async function getSongsDescription(categ, limit){
    const term = MODE_QUERIES[categ];
    let url = '';
    if(limit == 0){
        url = `https://itunes.apple.com/search?term=${term}&media=music`;
    }
    else{
        url = `https://itunes.apple.com/search?term=${term}&media=music&limit=${limit}`;
    }
    let arrayofsongs = [];
    const response = await fetch(url, {method:"GET"});
    const data = await response.json();
    const max = data["resultCount"];
    for(let i = 0;i <= limit;i++){
        const randomnumber = Math.floor(Math.random() * max);
        const song = {
            'Song Name': data["results"][randomnumber]["trackName"],
            'Artist': data["results"][randomnumber]["artistName"],
            'Time Length': data["results"][randomnumber]["trackTimeMillis"],
            'Audio': data["results"][randomnumber]["previewUrl"]
        }
        arrayofsongs.push(song);
    }
    console.log(arrayofsongs);
    return arrayofsongs;

}
function timeToLimit(h,m){
    const time = (Number(h) || 0) * 3600 + (Number(m) || 0) * 60;
    return Math.max(1,Math.floor(time/30));
}

function setActiveButton(btn){
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}
function selectReading(){
    setActiveButton(readButton);
    buttonselected = true;
    categoryselected = 'reading';
    playlistTitle.textContent = "Your Customized Playlist For: Reading...";
    console.log('reading button pressed');

}
function selectMath(){
    setActiveButton(mathButton);
    buttonselected = true;
    categoryselected = 'math';
    playlistTitle.textContent = "Your Customized Playlist For: Math/Science/Logic...";
}
function selectWriting(){
    setActiveButton(writeButton);
    buttonselected = true;
    categoryselected = 'writing';
    playlistTitle.textContent = "Your Customized Playlist For: Creativity/Art...";
}
function selectMemorization(){
    setActiveButton(memorizationButton);
    buttonselected = true;
    categoryselected = 'memory';
    playlistTitle.textContent = "Your Customized Playlist For: Memorization";
}
function selectRelax(){
    setActiveButton(relaxButton);
    buttonselected = true;
    categoryselected = 'relax';
    playlistTitle.textContent = "Your Customized Playlist For: Meditation/Relax/Sleep";
}
async function generatePlaylist(){
    if(!buttonselected){
        alert('Please select a study mode first!');
        return;
    }
    if(!limit || limit <= 0){
        limit = 1;
    }
    document.getElementById("spinner2").style.display = "block";
    songsList.innerHTML = '';
    if(categoryselected == 'reading'){
        playlistTitle.textContent = "Your Customized Playlist For: Reading...";
    }
    else if(categoryselected == 'math'){
        playlistTitle.textContent = "Your Customized Playlist For: Math/Science/Logic...";
    }
    else if(categoryselected == 'writing'){
        playlistTitle.textContent = "Your Customized Playlist For: Creativity/Art...";
    }
    else if(categoryselected == 'memory'){
        playlistTitle.textContent = "Your Customized Playlist For: Memorization...";
    }
    else if(categoryselected == 'relax'){
        playlistTitle.textContent = "Your Customized Playlist For: Meditation/Relax/Sleep...";
    }  
    const arraysongs = await getSongsDescription2(categoryselected,limit);
    document.getElementById("spinner2").style.display = "none";
    currentplaylist = arraysongs;
    if(!arraysongs || arraysongs.length === 0){
        playlistTitle.textContent = "No songs found. Try a different mode or increase time.";
        return;
    }
    arraysongs.forEach((s,i) => {
        const li = document.createElement("li");
        const [min, sec] = milisecToTime(s['Time Length']);
        li.textContent = `${s["Song Name"]} by ${s["Artist"]} (${min}:${sec.toString().padStart(2,"0")})`;
        li.addEventListener("click", () => {
            playFromList(i);
        });
        songsList.appendChild(li);
        })
    playlistTitle.textContent = `Playlist: ${arraysongs.length} songs for ${categoryselected}`;

}

function milisecToTime(ms){
    const min = Math. floor((ms/1000/60) << 0); 
    const sec = Math. floor((ms/1000) % 60);
    return [min, sec];
}

confirmButton.addEventListener('click',()=>{
    if(timehour.value != "" && timemin.value != ""){
        limit = timeToLimit(parseInt(timehour.value || 0),parseInt(timemin.value || 0));
    }
})

readButton.addEventListener('click', selectReading);
mathButton.addEventListener('click', selectMath);
writeButton.addEventListener('click', selectWriting);
memorizationButton.addEventListener('click', selectMemorization);
relaxButton.addEventListener('click', selectRelax);
generateButton.addEventListener('click',generatePlaylist);
playPauseButton.addEventListener('click',()=>{
    if(!audioload){
        loadSong(currentindex);
        startStudyTimer(); 
    }
    else if(audio.paused){
        audio.play();
        startStudyTimer(); 
        //timer begins again
    }
    else{
        audio.pause();
        stopStudyTimer(); 
        //timer stops
    }
})
forwardButton.addEventListener('click',nextSong);
backwardButton.addEventListener('click',prevSong);
shuffleButton.addEventListener('click',()=>{
    currentindex = Math.floor(Math.random() * currentplaylist.length);
    loadSong(currentindex);
})
volumeSlider.addEventListener('input', (e)=>{
    audio.volume = e.target.value;
})
audio.addEventListener("loadstart", () => {
    document.getElementById("spinner").style.display = "block";
});

audio.addEventListener("canplay", () => {
    document.getElementById("spinner").style.display = "none";
});
audio.addEventListener("loadedmetadata", ()=> {
    durationTimeDisplay.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", ()=> {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progressPercent + "%";
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('ended',()=>{
    nextSong();
    startStudyTimer(); // continues through songs
});
progressBarWrapper.addEventListener("click", (e)=>{
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration; // jump in track
});


async function getSongsDescription2(categ, limit){
    if(!categ || !MODE_QUERIES[categ]) return [];

    const term = MODE_QUERIES[categ];
    let result = [];
    const seenTrackIds = new Set();

    let attempts = 0;
    const maxAttempts = Math.max(200, limit * 8);

    while(result.length < limit && attempts < maxAttempts){
        attempts++;
        const innercategindex = Math.floor(Math.random() * term.length);
        const innercateg = term[innercategindex];

        const url = `https://itunes.apple.com/search?term=${innercateg}&media=music&limit=200`;
        try{
            const response = await fetch(url);
            if (!response.ok) {
                continue;
            }
            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                continue;
            }
            const idx = Math.floor(Math.random()*data.results.length);
            const song = data.results[idx];

            const trackId = song.trackId ?? `${song.trackName}-${song.artistName}`;
            if (!song.previewUrl || !song.trackName || seenTrackIds.has(trackId)) {
                continue;
            }
            seenTrackIds.add(trackId);
            result.push({
            "Song Name": song.trackName,
            "Artist": song.artistName,
            "Time Length": song.trackTimeMillis ?? 0,
            "Audio": song.previewUrl
            })
        }
        catch (err) {
            console.warn("fetch error", err);
            continue;
        }
    }
    if (result.length < limit) {
        console.warn(`Only found ${result.length} of requested ${limit} songs after ${attempts} attempts.`);
    }
    return result;
}

function loadSong(index){
    const song = currentplaylist[index];
    if (!song) return;
    audio.src = song.Audio;
    audioload = true;
    progressBar.style.width = "0%";
    currentTimeDisplay.textContent = "00:00";
    durationTimeDisplay.textContent = "00:00";
    document.getElementById("nowPlaying").textContent =  `Now Playing ${song['Song Name']} by ${song['Artist']}`;
    audio.load();
    audio.play();
}
function playFromList(index){
    currentindex = index;
    loadSong(index);
    audio.play();

    highlightCurrentSong();
}
function highlightCurrentSong(){
    const items = songsList.getElementsByTagName("li");

    // remove previous highlight
    [...items].forEach(li => li.classList.remove("playing"));

    const currentLi = items[currentindex];
    if (!currentLi) return;

    currentLi.classList.add("playing");

    // flash animation
    currentLi.classList.add("flash");
    setTimeout(()=> currentLi.classList.remove("flash"), 350);
}
function nextSong(){
    currentindex = (currentindex + 1)%currentplaylist.length;
    loadSong(currentindex);
}
function prevSong(){
    currentindex = (currentindex - 1 + currentplaylist.length)%currentplaylist.length;
    loadSong(currentindex);
}
function formatTime(t) {
    if (!t) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2,"0")}`;
}
function startStudyTimer(){
    if(studyTimerInterval) return; // prevent duplicates

    studyTimerInterval = setInterval(() => {
        studySeconds++;

        const h = Math.floor(studySeconds / 3600);
        const m = Math.floor((studySeconds % 3600) / 60);
        const s = studySeconds % 60;

        document.getElementById("studyHours").textContent = h.toString().padStart(2,'0');
        document.getElementById("studyMinutes").textContent = m.toString().padStart(2,'0');
        document.getElementById("studySeconds").textContent = s.toString().padStart(2,'0');
    }, 1000);
}

function stopStudyTimer(){
    clearInterval(studyTimerInterval);
    studyTimerInterval = null;
}





