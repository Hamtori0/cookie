const titleScreen = document.getElementById('title-screen');
const playScreen = document.getElementById('play-screen');
const playBg = document.getElementById('play-bg');
const startBtn = document.getElementById('start-btn');
const dialogueBox = document.getElementById('dialogue-box');
const speakerName = document.getElementById('speaker-name');
const dialogueText = document.getElementById('dialogue-text');
const choiceBox = document.getElementById('choice-box');
const choiceBtns = document.querySelectorAll('.choice-btn');
const ingredientStage = document.getElementById('ingredient-stage');
const ingBtns = document.querySelectorAll('.ing-img-btn');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');

// 📌 모바일 화면 전환 시 빈 배경(핑크색) 깜빡임 방지를 위한 이미지 사전 로드
const preloadImages = [
    'title-bg.jpg',
    'play-bg.jpg',
    'dialogue-bg.png',
    'title-bg-box.png',
    'bowl-empty.jpg',
    'bowl-butter.jpg',
    'bowl-sugar.jpg',
    'bowl-salt.jpg',
    'bowl-egg.jpg',
    'bowl-flour.jpg',
    'empty-desk.png',
    'roll-dough.png',
    'cookie-cut.png',
    'oven-in.png',
    'oven-bake.png',
    'package-end.png',
    'embarrassed-bg.jpg'
];

preloadImages.forEach((src) => {
    const img = new Image();
    img.src = src;
});

// 📜 1. 기본 인트로 대사 목록
const introDialogue = [
    { name: "원희", text: "이제 베이킹을 시작해 볼까? 어떤 걸 만들지 고민인데..." },
    { name: "원희", text: "역시 첫 도전이니까 가장 무난한 버터 쿠키가 좋겠어!" },
    { name: "원희", text: "근데 어떡하지... 혼자 만들기는 어려울 것 같은데 글릿한테 도움을 청해볼까?" },
    { name: "원희", text: "저기... 쿠키 만드는 걸 도와줄 수 있을까?" }
];

// 📜 2. '아니요' 선택 시 나오는 대사 목록
const noDialogue = [
    { name: "원희", text: "아, 그렇구나... 바쁘지? 갑자기 부탁해서 미안해!" },
    { name: "원희", text: "그래도 혼자서 열심히 만들어 볼게! 다음엔 꼭 같이 만들자!" }
];

// 📜 3. 후반부 공정 컷씬 목록 (작업대부터 시작)
const bakingScenes = [
    // [0] 빈 작업대 컷
    {
        bg: "url('empty-desk.png')",
        lines: [
            "깨끗하게 정리된 작업대 세팅 완료!",
            "이제 작업대 위로 반죽을 올려서 반듯하게 펴볼까~?"
        ]
    },
    // [1] 펴진 반죽 컷
    {
        bg: "url('roll-dough.png')",
        lines: [
            "작업대 위로 반죽을 예쁘게 펴줬어!",
            "이제 귀여운 모양틀로 쿠키 반죽을 콕콕 찍어보자!"
        ]
    },
    // [2] 쿠키틀 찍은 컷
    {
        bg: "url('cookie-cut.png')",
        lines: [
            "귀여운 모양틀로 쿠키 반죽도 콕콕 찍어냈지!",
            "이제 쿠키 모양도 다 찍었으니 오븐에 넣어볼까~?"
        ]
    },
    // [3] 오븐에 넣는 컷
    {
        bg: "url('oven-in.png')",
        lines: [
            "자, 틀에 찍은 반죽을 조심스럽게 오븐에 쏙 넣었어!",
            "타지 않게 온도를 잘 맞춰서 노릇노릇하게 구워보자!"
        ]
    },
    // [4] 오븐 안쪽 노릇노릇 굽기 컷
    {
        bg: "url('oven-bake.png')",
        lines: [
            "와, 오븐 안쪽에서 노릇노릇하게 구워지는 거 봐! 달콤한 버터 냄새가 진동해~",
            "이제 다 구워진 쿠키를 꺼내서 예쁘게 포장해 볼까?"
        ]
    },
    // [5] 최종 포장 엔딩 컷 (대사 수정 완료)
    {
        bg: "url('package-end.png')",
        lines: [
            "짜잔~ 리본까지 묶어서 예쁘게 포장 완료!",
            "오늘 쿠키 만드는 거 도와줘서 정말 고마워! 다음에도 나랑 맛있는 쿠키 만들러 와줄 거지?"
        ]
    }
];

let currentList = introDialogue; 
let currentDialogueIndex = 0; 
let isTyping = false;         
let timer = null;             
let currentText = "";         
let canClickDialogue = false; 
let gameState = 'intro'; 

let bakingStep = 0; 
let sceneIndex = 0;
let sceneLineIndex = 0;

// [게임 시작] 버튼 클릭 시
startBtn.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    playScreen.classList.remove('hidden');
    
    playBg.style.backgroundImage = "url('play-bg.jpg')";
    playBg.classList.remove('blurred');
    dialogueBox.classList.remove('hidden');
    choiceBox.classList.add('hidden');
    ingredientStage.classList.add('hidden');
    restartBtn.classList.add('hidden');
    backBtn.classList.add('hidden');

    currentList = introDialogue;
    currentDialogueIndex = 0;
    gameState = 'intro';
    bakingStep = 0;
    sceneIndex = 0;
    sceneLineIndex = 0;
    
    let bgm = document.getElementById('bgm');
    if (!bgm) {
        bgm = document.createElement('audio');
        bgm.id = 'bgm';
        bgm.src = 'bgm.mp3';
        bgm.loop = true;
        document.body.appendChild(bgm);
    }
    
    bgm.volume = 0.4;
    bgm.play().catch(error => {
        console.log("오디오 재생 차단:", error);
    });

    showDialogue(currentDialogueIndex);

    canClickDialogue = false;
    setTimeout(() => {
        canClickDialogue = true;
    }, 300);
});

// [대화창(#dialogue-box)] 클릭 시
dialogueBox.addEventListener('click', () => {
    if (!canClickDialogue || gameState === 'choice' || gameState === 'ingredient' || gameState === 'end' || gameState === 'end_no') return; 

    // 타이핑 중일 때 클릭하면 대사 즉시 완성
    if (isTyping) {
        clearInterval(timer);
        dialogueText.textContent = currentText;
        isTyping = false;
        return;
    }

    // 👇 반죽 완성 직후(bowl-flour.jpg) 상태에서 클릭 시 작업대 컷씬으로 진입!
    if (gameState === 'dough_complete') {
        gameState = 'baking_process';
        sceneIndex = 0;
        sceneLineIndex = 0;
        
        playBg.style.backgroundImage = bakingScenes[0].bg; 
        speakerName.textContent = "원희";
        showFullDialogue(bakingScenes[0].lines[0]);
        return;
    }

    // 👇 반죽 완성 후 공정 컷씬 단계
    if (gameState === 'baking_process') {
        sceneLineIndex++;

        if (sceneLineIndex < bakingScenes[sceneIndex].lines.length) {
            speakerName.textContent = "원희";
            showFullDialogue(bakingScenes[sceneIndex].lines[sceneLineIndex]);
        } else {
            sceneIndex++;
            sceneLineIndex = 0;

            if (sceneIndex < bakingScenes.length) {
                playBg.style.backgroundImage = bakingScenes[sceneIndex].bg;
                speakerName.textContent = "원희";
                showFullDialogue(bakingScenes[sceneIndex].lines[sceneLineIndex]);
            }
        }

        if (sceneIndex === bakingScenes.length - 1 && sceneLineIndex === bakingScenes[sceneIndex].lines.length - 1) {
            gameState = 'end';
            setTimeout(() => {
                restartBtn.classList.remove('hidden');
            }, 1200);
        }
        return;
    }

    // 👇 일반 인트로 & '아니요' 루트 대사 진행
    currentDialogueIndex++;
    if (currentDialogueIndex < currentList.length) {
        showDialogue(currentDialogueIndex);
    } else {
        if (gameState === 'intro') {
            speakerName.textContent = "";
            dialogueText.textContent = "";
            dialogueBox.classList.add('hidden');
            playBg.classList.add('blurred'); // 배경 블러 처리
            choiceBox.classList.remove('hidden');
            gameState = 'choice';
        } else if (gameState === 'no_route') {
            backBtn.classList.remove('hidden');
            gameState = 'end_no';
        }
    }
});

// 리스트 기반 타이핑 효과 함수
function showDialogue(index) {
    if (timer) clearInterval(timer);
    const data = currentList[index];
    speakerName.textContent = data.name;
    currentText = data.text;
    dialogueText.textContent = ""; 
    
    let charIndex = 0;
    isTyping = true;
    
    timer = setInterval(() => {
        if (charIndex < currentText.length) {
            dialogueText.textContent += currentText.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(timer);
            isTyping = false;
        }
    }, 30);
}

// 단일 텍스트용 타이핑 효과 함수
function showFullDialogue(text) {
    if (timer) clearInterval(timer);
    currentText = text;
    dialogueText.textContent = "";
    let charIndex = 0;
    isTyping = true;
    
    timer = setInterval(() => {
        if (charIndex < currentText.length) {
            dialogueText.textContent += currentText.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(timer);
            isTyping = false;
        }
    }, 30);
}

// [예 / 아니요 선택지 버튼] 클릭 시
choiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedChoice = e.currentTarget.getAttribute('data-choice');
        choiceBox.classList.add('hidden');
        playBg.classList.remove('blurred'); // 블러 해제
        dialogueBox.classList.remove('hidden');

        if (selectedChoice === 'yes') {
            gameState = 'ingredient';
            bakingStep = 1; 
            
            playBg.style.backgroundImage = "url('bowl-empty.jpg')";
            
            speakerName.textContent = "원희";
            showFullDialogue("고마워! 먼저 볼에 버터를 넣고 부드럽게 풀어 줘!");
            ingredientStage.classList.remove('hidden');

        } else {
            gameState = 'no_route';
            playBg.style.backgroundImage = "url('embarrassed-bg.jpg')";
            
            currentList = noDialogue;
            currentDialogueIndex = 0;
            showDialogue(currentDialogueIndex);
        }
    });
});

// [재료 이미지 버튼] 클릭 시
ingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const clickedIng = btn.getAttribute('data-ing'); 
        
        if (bakingStep === 1) {
            if (clickedIng === 'butter') {
                playBg.style.backgroundImage = "url('bowl-butter.jpg')";
                speakerName.textContent = "원희";
                showFullDialogue("좋아, 버터가 부드럽게 잘 풀렸어! 다음엔 설탕을 넣어 줘!");
                bakingStep = 2; 
            } else { wrongOrderAlert(); }
        }
        else if (bakingStep === 2) {
            if (clickedIng === 'sugar') {
                playBg.style.backgroundImage = "url('bowl-sugar.jpg')";
                speakerName.textContent = "원희";
                showFullDialogue("달콤한 설탕이 들어갔네! 이제 소금을 한 꼬집 넣어 줘!");
                bakingStep = 3; 
            } else { wrongOrderAlert(); }
        }
        else if (bakingStep === 3) {
            if (clickedIng === 'salt') {
                playBg.style.backgroundImage = "url('bowl-salt.jpg')";
                speakerName.textContent = "원희";
                showFullDialogue("좋았어! 단짠 밸런스 완벽해! 이제 달걀을 넣어 줘!");
                bakingStep = 4; 
            } else { wrongOrderAlert(); }
        }
        else if (bakingStep === 4) {
            if (clickedIng === 'egg') {
                playBg.style.backgroundImage = "url('bowl-egg.jpg')";
                speakerName.textContent = "원희";
                showFullDialogue("달걀도 분리되지 않게 잘 섞였다! 마지막으로 체 친 밀가루를 넣어 줘!");
                bakingStep = 5; 
            } else { wrongOrderAlert(); }
        }
        else if (bakingStep === 5) {
            if (clickedIng === 'flour') {
                ingredientStage.classList.add('hidden');
                
                playBg.style.backgroundImage = "url('bowl-flour.jpg')"; 
                speakerName.textContent = "원희";
                showFullDialogue("와아! 드디어 뽀얗고 완벽한 쿠키 반죽이 완성됐어!");
                
                gameState = 'dough_complete';
            } else { wrongOrderAlert(); }
        }
    });
});

// 순서가 틀렸을 때 원희의 반응 대사 함수
function wrongOrderAlert() {
    speakerName.textContent = "원희";
    showFullDialogue("어라? 지금 그 재료를 넣을 순서가 아닌 것 같아! 레시피를 다시 생각해볼까?");
}

// [처음으로 돌아가기] 버튼 클릭 시
restartBtn.addEventListener('click', () => {
    playScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
    restartBtn.classList.add('hidden');
    playBg.classList.remove('blurred');
    playBg.style.backgroundImage = "url('play-bg.jpg')";
});

// [이전으로 돌아가기] 버튼 클릭 시 (예, 아니요 선택창으로 복귀)
backBtn.addEventListener('click', () => {
    backBtn.classList.add('hidden');
    playBg.style.backgroundImage = "url('play-bg.jpg')";
    playBg.classList.add('blurred'); // 다시 블러 적용
    
    dialogueBox.classList.add('hidden');
    choiceBox.classList.remove('hidden');
    gameState = 'choice';
});
