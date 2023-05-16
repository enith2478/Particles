// setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
ctx.fillStyle = 'white';
const gradient = ctx.createLinearGradient(0,0,canvas.width, canvas.height);
gradient.addColorStop(0, 'yellow');
gradient.addColorStop(0.5, 'orangered');
gradient.addColorStop(1, 'gold');
ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';

class Particle{
    constructor(effect){
        this.effect = effect;
        this.radius = Math.floor(Math.random() * 10 + 1); // Randomizes the size of the particles
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
        this.vx = Math.random() * 1 - 0.5; //velocity on the x axis
        this.vy = Math.random() * 1 - 0.5; //velocity on the y axis
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.95; //Controls the pushing force.
    }
    draw(context){
        // context.fillStyle = 'hsl(' + this.x  * 0.5 + ', 100%, 50%)';  //Try this one too.
        context.fillStyle = 'white'; //Comment out this line if you use the one above
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0,    Math.PI * 2);
        context.fill();
        context.stroke();
    }
    update(){
        if (this.effect.mouse.pressed){
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const force = this.effect.mouse.radius / distance;
            if (distance < this.effect.mouse.radius){
                const angle = Math.atan2(dy, dx);
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
            }
        }
        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;
        if (this.x < this.radius){
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x > this.effect.width - this.radius){
            this.x = this.effect.width - this.radius;
            this.vx *= -1;}
        if (this.y < this.radius){
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y > this.effect.height - this.radius){
            this.y = this.effect.height - this.radius;
            this.vy *= -1;}

       
    }
    reset(){
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}
class Effect{
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 600;
        this.createParticles();

        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 150 // Size of the space when the mouse is pressed.
        }

        window.addEventListener('resize', e => {
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
        });
        window.addEventListener('mousemove', e =>{
            if (this.mouse.pressed){
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            }
        })
        window.addEventListener('mousedown', e =>{
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        })
        window.addEventListener('mouseup', e =>{
            this.mouse.pressed = false;
        })
    }
   
    createParticles(){
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this));
        }
    }
    handleParticles(context){
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
        
    }
    connectParticles(context){ // The title says it all
        const maxDistance = 80; // You determine conection limit here
        for (let a = 0; a < this.particles.length; a++){
            for (let b = a; b < this.particles.length; b++){
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);
                if (distance < maxDistance){
                    context.save();
                    const opacity = 1 - (distance/maxDistance)
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    resize(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        const gradient = this.context.createLinearGradient(0,0,width, height);
        gradient.addColorStop(0, 'yellow');
        gradient.addColorStop(0.5, 'orangered');
        gradient.addColorStop(1, 'gold');
        this.context.fillStyle = gradient;
        this.context.strokeStyle = 'white';
        this.particles.forEach(particle => {
            particle.reset();
        })
    }
}
const effect = new Effect(canvas, ctx);

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the scene after each frame is drawn.
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();