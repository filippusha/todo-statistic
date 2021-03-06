const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getAllToDoComments() {
    let text = getFiles().join();
    let lines = text.split('\n')
    let toDoLines = [];
    for (let line of lines) {
        if (line.includes('// TODO ') && !line.includes('delete this')) toDoLines.push(line); // delete this
    }
    let result = toDoLines.map(item => item.slice(item.indexOf('/') + 8));
    return result;
}

function getImportantComments() {
    let allComments = getAllToDoComments();
    let importantComments = [];
    for (let comment of allComments) {
        if (comment.includes('!')) {
            importantComments.push(comment)
        }
    }
    return importantComments;
}

function includesFixedTimes(string, symbol, timesNumber) {
    let counter = 0;
    let strToArr = string.split('');
    for (let sym of strToArr) {
        if (sym === symbol) counter++;
    }
    return counter === timesNumber;
}

function getFormattedComments() {
    let allComments = getAllToDoComments();
    let formattedComments = [];
    for (let comment of allComments) {
        if (isFormatted(comment)) {
            formattedComments.push(comment);
        }
    }
    return formattedComments;
}

function getUnformattedComments() {
    let allComments = getAllToDoComments();
    let unformattedComments = [];
    for (let comment of allComments) {
        if (!isFormatted(comment)) {
            unformattedComments.push(comment);
        }
    }
    return unformattedComments;
}

function getCommentsByUsername(username) {
    username = username.toLowerCase();
    let formattedComments = getFormattedComments();
    let userComments = [];
    for (let comment of formattedComments) {
        if (comment.split(';')[0].trim().toLowerCase() === username) {
            userComments.push(comment);
        }
    }
    return userComments;
}

function getCommentsSortedByImportance() {
    let comments = getAllToDoComments();
    let sortedComments = comments.sort(function(a, b) {
        return a.replace(/[^!]/g, "").length - b.replace(/[^!]/g, "").length;
    })
    return sortedComments.reverse();
}

function getCommentsSortedByUsers() {
    let comments = getFormattedComments();
    let users = [];
    for (let comment of comments) {
        let user = comment.split(';')[0].trim().toLowerCase();
        users.push(user);
    }
    users = unique(users);
    let result = [];
    for (let user of users) {
        let userComments = getCommentsByUsername(user);
        for (let comment of userComments) {
            result.push(comment);
        }
    }
    for (let comment of getUnformattedComments()) {
        result.push(comment);
    }
    return result;
}

function getCommentsSortedByDate() {
    let comments = getFormattedComments()
    let sortedComments = comments.sort(function (a, b) {
        let aDate = new Date(a.split(';')[1].trim());
        let bDate = new Date(b.split(';')[1].trim());
        return (aDate.getFullYear() * 256 + (aDate.getMonth() + 1) * 30 + aDate.getDate()) - (bDate.getFullYear() * 256 + (bDate.getMonth() + 1) * 30 + bDate.getDate());
    });
    for (let comment of getUnformattedComments()) {
        sortedComments.push(comment);
    }
    return sortedComments.reverse();
}

function unique(arr) {
    let result = [];
    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }
    return result;
}

function isFormatted(comment) {
    return includesFixedTimes(comment, ';', 2);
}

function getCommentsFilteredByDate(date) {
    let comments = getFormattedComments();
    let filteredComments = comments.filter(comment => {
        return new Date(comment.split(';')[1].trim()) > date;
    });
    return filteredComments;
}

function showOnConsole(comments) {

    for (let comment of comments) {
        console.log(comment);
    }

}

function processCommand(command) {
    let splittedCommand = command.split(' ');
    switch (splittedCommand[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            showOnConsole(getAllToDoComments());
            break;
        case 'important':
            showOnConsole(getImportantComments());
            break;
        case 'user':
            let username = splittedCommand[1];
            showOnConsole(getCommentsByUsername(username));
            break;
        case 'sort':
            switch (splittedCommand[1]) {
                case 'importance':
                    showOnConsole(getCommentsSortedByImportance());
                    break;
                case 'user':
                    showOnConsole(getCommentsSortedByUsers());
                    break;
                case 'date':
                    showOnConsole(getCommentsSortedByDate());
                    break;
                default:
                    console.log('unknown command');
                    break;
            }
            break;
        case 'date':
            showOnConsole(getCommentsFilteredByDate(new Date(splittedCommand[1])));
            break;
        default:
            console.log('wrong command');
            break;
    }
}



// TODO you can do it!
