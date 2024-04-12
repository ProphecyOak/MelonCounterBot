const logLevels = [
    "STATUS", //for bot status updates
    "POST", //for post log
    "REACTION", //for melon log
    "COUNTER" //for gallery counter
]

const levels = {}
let x = 0;
logLevels.forEach(level => {
    levels[level] = x;
    x ++;
});

const maxLevelLength = logLevels.reduce((acc, e) => acc.length > e.length ? acc : e, "").length;

function logEvent(eventText, level) {
    const levelText = logLevels[level]
    const padding = maxLevelLength - levelText.length;
    console.log(`[ ${levelText} ]${" ".repeat(padding)}  ${eventText}`);
}

module.exports = { logEvent, levels};