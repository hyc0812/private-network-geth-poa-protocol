var mining_threads = 1

function checkWork() {
    if (eth.getBlock("pending").transactions.length > 0) {
        if (eth.mining) return;
        console.log("== Pending transactions! Mining...");
        miner.start(mining_threads);
    } else {
        miner.stop();
        console.log("== No transactions! Mining stopped.");
    }
}

eth.filter("latest", function(err, block) { checkWork(); });
eth.filter("pending", function(err, block) { checkWork(); });

checkWork();

// Below:  
// alternative to mineWhenNeeded.js
//  Mining until x confirmations have been achieved

// This question is particularly relevant to private chains where transactions may be more sporadic than on public chains. In some applications it may be beneficial to continue mining for a set number of blocks after the latest transaction to ensure adequate confirmations are reached before mining stops and avoiding the latest transaction only receiving one confirmation (e.g. when using mist on private networks it likes to see 12 confirmations):

// var mining_threads = 1
// var txBlock = 0

// function checkWork() {
// if (eth.getBlock("pending").transactions.length > 0) {
//     txBlock = eth.getBlock("pending").number
//     if (eth.mining) return;
//     console.log("  Transactions pending. Mining...");
//     miner.start(mining_threads)
//     while (eth.getBlock("latest").number < txBlock + 12) {
//       if (eth.getBlock("pending").transactions.length > 0) txBlock = eth.getBlock("pending").number;
//         }
//     console.log("  12 confirmations achieved; mining stopped.");
//     miner.stop()
// }
// else {
//     miner.stop()
//      }
// }

// eth.filter("latest", function(err, block) { checkWork(); });
// eth.filter("pending", function(err, block) { checkWork(); });

// checkWork();