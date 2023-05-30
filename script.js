/** @type {HTMLCanvasElement} */
window.addEventListener("load", function () {
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const container = document.getElementById("container");
  const cursor = document.getElementById("cursor");
  const nameInput = document.getElementById("name");
  nameInput.value = localStorage.getItem("name");

  const table = document.querySelector("#leaderboard");

  document.addEventListener("mousemove", (e) => {
    cursor.setAttribute(
      "style",
      `top: ${e.pageY - 35}px; left: ${e.pageX - 35}px;`
    );
  });

  let audio = document.getElementById("myAudio");
  let audio1 = document.getElementById("myAudio1");
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const collisionCanvas = document.getElementById("collisionCanvas");
  const collisionCtx = collisionCanvas.getContext("2d");
  collisionCanvas.width = window.innerWidth;
  collisionCanvas.height = window.innerHeight;

  let score = 0;
  let gameOver = false;
  ctx.font = "30px Impact";

  let timeToNextRaven = 0;
  let ravenInterval = 500;
  let lastTime = 0;

  let ravens = [];

  class Raven {
    constructor() {
      this.spriteWidth = 266;
      this.spriteHeight = 188;
      this.sizeModifier = Math.random() * 0.6 + 0.4;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      this.directionX = Math.random() * 5 + 3;
      this.directionY = Math.random() * 5 - 2.5;
      this.markedForDeletion = false;
      this.image = new Image();
      this.image.src = "enemy2.png";
      this.frame = 0;
      this.maxFrame = 4;
      this.timeSinceFlap = 0;
      this.flapInterval = Math.random() * 50 + 50;
      this.randomColors = [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
      ];
      this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`;
      this.hasTrail = Math.random() > 0.5;
    }
    update(deltatime) {
      if (this.y < 0 || this.y >= canvas.height - this.height) {
        this.directionY = this.directionY * -1;
      }
      this.x -= this.directionX;
      this.y += this.directionY;
      if (this.x < 0 - this.width) this.markedForDeletion = true;
      this.timeSinceFlap += deltatime;
      if (this.timeSinceFlap > this.flapInterval) {
        if (this.frame > this.maxFrame) this.frame = 0;
        else this.frame++;
        this.timeSinceFlap = 0;
        if (this.hasTrail) {
          for (let i = 0; i < 5; i++) {
            particles.push(
              new Particle(this.x, this.y, this.width, this.color)
            );
          }
        }
      }
      if (this.x < 0 - this.width) gameOver = true;
    }
    draw() {
      collisionCtx.fillStyle = this.color;
      collisionCtx.fillRect(this.x, this.y, this.width, this.height);
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  let explosions = [];

  class Explosion {
    constructor(x, y, size) {
      this.image = new Image();
      this.image.src = "boom.png";
      this.spriteWidth = 200;
      this.spriteHeight = 179;
      this.size = size;
      this.x = x;
      this.y = y;
      this.angle = Math.random() * 6.2;
      this.frame = 0;
      this.sound = new Audio();
      this.sound.src = "boom.wav";
      this.timeSinceLastFrame = 0;
      this.timer = 0;
      this.frameInterval = 200;
      this.markedForDeletion = false;
    }
    update(deltatime) {
      if (this.frame === 0) this.sound.play();

      this.timeSinceLastFrame += deltatime;
      if (this.timeSinceLastFrame >= this.frameInterval) {
        this.frame++;
        this.timeSinceLastFrame = 0;
        if (this.frame > 5) this.markedForDeletion = true;
      }
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y - this.size / 4,
        this.size,
        this.size
      );
    }
  }

  let particles = [];
  class Particle {
    constructor(x, y, size, color) {
      this.size = size;
      this.x = x + this.size / 2 + Math.random() * 50 - 25;
      this.y = y + this.size / 3 + Math.random() * 50 - 25;
      this.radius = (Math.random() * this.size) / 10;
      this.maxRadius = Math.random() * 20 + 35;
      this.markedForDeletion = false;
      this.speedX = Math.random() * 1 + 0.5;
      this.color = color;
    }
    update() {
      this.x += this.speedX;
      this.radius += 0.3;
      if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = 1 - this.radius / this.maxRadius;
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawScore() {
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 150, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 150, 80);
  }

  function drawGameOver() {
    // ctx.textAlign = "center";
    // ctx.fillStyle = "black";
    // ctx.fillText(
    //   "GAME OVER, your score is  " + score,
    //   canvas.width / 2,
    //   canvas.height / 2
    // );
    // ctx.fillStyle = "WHITE";
    // ctx.fillText(
    //   "GAME OVER, your score is  " + score,
    //   canvas.width / 2 + 5,
    //   canvas.height / 2
    // );

    postScore();
    document.getElementById("startGame").style.display = "none";
    document.getElementById(
      "gameover"
    ).innerHTML = `GAME OVER, your score is ${score}`;
    document.getElementById("gameover").style.display = "block";
    table.style.display = "table";
    audio.pause();
    audio1.play();
    container.style.display = "flex";
    startButton.style.display = "none";
    restartButton.style.display = "block";
    cursor.classList.remove("show");
    document.body.style.cursor = "auto";
  }

  window.addEventListener("click", function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach((object) => {
      if (
        pc[0] === object.randomColors[0] &&
        pc[1] === object.randomColors[1] &&
        pc[2] === object.randomColors[2]
      ) {
        object.markedForDeletion = true;
        score++;
        explosions.push(
          new Explosion(
            object.x,
            object.y,
            object.randomColors[0],
            object.width
          )
        );
      }
    });
  });

  function animate(timestamp) {
    cursor.classList.add("show");
    document.body.style.cursor = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    if (timeToNextRaven > ravenInterval) {
      ravens.push(new Raven());
      timeToNextRaven = 0;
      ravens.sort((a, b) => a.width - b.width);
    }
    drawScore();
    ravens = ravens.filter((object) => !object.markedForDeletion);
    explosions = explosions.filter((object) => !object.markedForDeletion);
    particles = particles.filter((object) => !object.markedForDeletion);
    [...particles, ...ravens, ...explosions].forEach((object) => {
      object.update(deltatime);
      object.draw();
    });
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
  }

  startButton.addEventListener("click", function (e) {
    if (nameInput.value.length < 2) {
      return false;
    }
    localStorage.setItem("name", nameInput.value);
    container.style.display = "none";
    nameInput.style.display = "none";
    animate(0);
    audio.play();
  });

  restartButton.addEventListener("click", function (e) {
    container.style.display = "none";
    startButton.style.display = "block";
    // cursor.style.display = "none";
    timeToNextRaven = 0;
    ravenInterval = 500;
    lastTime = 0;
    ravens = [];
    explosions = [];
    particles = [];
    score = 0;
    gameOver = false;
    animate(0);
    audio.play();
  });

  let url =
    "https://game-leaderboard-e4b54-default-rtdb.firebaseio.com/leaderboard.json";

  const postScore = () => {
    let data = {
      name: nameInput.value,
      score: score,
    };

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        getScore();
      })
      .catch((error) => {
        // Handle any errors
        console.error(error);
      });
  };

  const getScore = () => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data
        let scoreData = [];
        for (let key in data) {
          scoreData.push(data[key]);
        }
        let sortedScoreData = scoreData.sort((a, b) => b.score - a.score);

        const tableBody = document.querySelector("#leaderboard tbody");
        let stopLoop = false;
        sortedScoreData.forEach((row, index) => {
          if (stopLoop) return;
          const newRow = document.createElement("tr");
          const idCell = document.createElement("td");
          const nameCell = document.createElement("td");
          const scoreCell = document.createElement("td");

          idCell.textContent = index + 1;
          nameCell.textContent = row.name;
          scoreCell.textContent = row.score;

          newRow.appendChild(idCell);
          newRow.appendChild(nameCell);
          newRow.appendChild(scoreCell);

          tableBody.appendChild(newRow);
          if (index === 9) {
            stopLoop = true;
          }
        });
      })
      .catch((error) => {
        // Handle any errors
        console.error(error);
      });
  };
});
