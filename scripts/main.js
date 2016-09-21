'use strict';

window.onload = function() {
    main();
};

function main() {
    var game = new Game(document.getElementById("tutorial"), 800, 600);

    console.log("Game was created!");

    game.setFrameRate(50);
    
    // MAIN CYCLE
    game.run().then( (exitStatus) => {
        console.log(`Process terminated. Status: ${exitStatus}`);
    }).catch( (error) => {
        console.error(`Error: ${error}`);
    });
}