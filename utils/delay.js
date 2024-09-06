const delay = (delayTime)=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delayTime);
    });
}

module.exports = delay;