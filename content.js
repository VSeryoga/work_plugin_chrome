$(document).ready(function () {
    let db;
    let nameDb = 'db';
    let openRequest = indexedDB.open(nameDb, 1);
    openRequest.onupgradeneeded = function () {
    };

    openRequest.onerror = function () {
        console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function () {
        db = openRequest.result;
        getWork(db);
    };
    openRequest.onupgradeneeded = function () {
        db = openRequest.result;
        if (!db.objectStoreNames.contains('work')) {
            db.createObjectStore('work', { keyPath: 'id', autoIncrement: true });
        }
    };

    $("body").prepend('<div id="popup_content"><div id="show_all"><div id="start">Старт</div></div><div id="menu"><div class="q"></div><div class="q"></div><div class="q"></div></div><div id="report" title="Отчет по задачам в консоли">O</div></div>');
    $("body").prepend('<div id="result_timer"><div id="close_result_timer">x</div><div id="content"></div></div>');


    $('body').on('click', '#menu', function () {
        showAll();
    });
    $('body').on('click', '#close_result_timer', function () {
        $('#result_timer').hide();
    })
    $('body').on('click', '#stop', function () {
        let id = parseInt($(this).attr('data-id'));
        let transaction = db.transaction("work", "readwrite");
        let work = transaction.objectStore("work");

        let request = work.openCursor(null, 'prev');

        request.onsuccess = function () {
            let cursor = request.result;
            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;
                // console.log(key, id);

                if (key == id) {
                    value.stopTime = new Date();
                    const request = cursor.update(value);
                    request.onsuccess = function () {
                        $('#show_all').html('<div id="start">Старт</div>');
                        $('#popup_content').removeClass('bg-red');
                    };

                }
                // console.log(key, value);
                // cursor.continue();
            } else {
                console.log("");
                $('#show_all').html('<div id="start">Старт</div>');
                $('#popup_content').removeClass('bg-red');
            }
        };

    });

    $('body').on('click', '#report', function () {
        let text = '';
        $('#tcLeftTrees_treeFavourites  > ul > li > ul > li').each(function (i, el) {
            
            let status = $(el).find('.subcatFolder .rtText').text();
            if (status.indexOf("На бою") != -1 || status.indexOf("Прочее") != -1) {
                // console.log(text);
                
                return;
            }
            // console.log(status);
            $(el).find('.id_task_menu').each(function (a, e) {
                let task = $(e).text();
                // console.log(task + ' - ' + status.split(' (')[0]);
                text += task + ' - ' + status.split(' (')[0] + "\n";
            });
           
        });
    });

    $('#tcLeftTrees_treeFavourites  > ul > li > ul > li').each(function (i, el) {
            
        let status = $(el).find('.subcatFolder .rtText').text();

        let num = $(el).find('ul > li').length - 1;
        
        $(el).find('.subcatFolder .rtText').text(status + ' (' + String(num) + ')');
    });


    $('body').on('click', '#start', function () {

        let taskId = $("#container-3 .ng-star-inserted").contents().find('frame').contents().find('.mtftb-tasknum i').attr('data-clipboard-text');

        if ($(this).hasClass('work')) {

        }

        if (taskId == undefined) {
            alert('Не выбрана задача');
            return;
        }

        let transaction = db.transaction("work", "readwrite"); // (1)

        // получить хранилище объектов для работы с ним
        let work = transaction.objectStore("work"); // (2)

        let task = {
            workId: taskId,
            startTime: new Date(),
            stopTime: false
        };

        let request = work.add(task); // (3)

        request.onsuccess = function () { // (4)
            // console.log("добавлена в хранилище", request.result);
            $('#show_all').html('<span onclick="OpenTask(null, ' + taskId + ')"> №' + taskId + '</span><div id="stop" data-id=' + request.result + '">Стоп</div>');
            $('#popup_content').addClass('bg-red');
        };

        request.onerror = function () {
            console.log("Ошибка", request.error);
        };
    });

    function showAll() {
        let transaction = db.transaction("work", "readwrite");
        let work = transaction.objectStore("work");

        let request = work.openCursor();
        let result = {};
        let sumTime = {};

        request.onsuccess = function () {
            let cursor = request.result;

            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;
                
                if (value.stopTime == false) {
                    result[value.startTime.toLocaleDateString()][value.workId] = 'work';
                } else {
                    let sec = (value.stopTime.getTime() - value.startTime.getTime()) / 1000;

                    if (result[value.startTime.toLocaleDateString()] == undefined) {
                        result[value.startTime.toLocaleDateString()] = {};
                    }
                    if (sumTime[value.startTime.toLocaleDateString()] == undefined) {
                        sumTime[value.startTime.toLocaleDateString()] = sec;
                    } else {
                        sumTime[value.startTime.toLocaleDateString()] += sec;
                    }

                    if (result[value.startTime.toLocaleDateString()][value.workId] == undefined) {
                        result[value.startTime.toLocaleDateString()][value.workId] = sec;
                    } else {
                        result[value.startTime.toLocaleDateString()][value.workId] = result[value.startTime.toLocaleDateString()][value.workId] + sec;
                    }
                }
                
                cursor.continue();
            } else {
                // console.log(result);
                let html = '';
                let today = new Date().toLocaleDateString();
                
                for (let i in result) {
                    let deleteButtton = '<span id="sum_time">' + secondsToHms(sumTime[i]) + '</span>';
                    if (i != today) {
                        deleteButtton = '<span class="delete-day" data-day="' + i + '">Удалить</span>';
                    }
                    html += '<div><span class="day">' + i + '</span>' + deleteButtton + '</div>';
                    for (let a in result[i]) {
                        let text = '';
                        if (result[i][a] == 'work') {
                            text = 'В работе';
                        } else {
                            text = secondsToHms(result[i][a]);
                        }
                        html += '<div><span class="task" onclick="OpenTask(null, ' + a + ')">№' + a + ' - <span class="time_task">' + text + '</span></span></div>';
                    }
                }
                $('#result_timer #content').html(html);
                $('#result_timer sum_time').text(secondsToHms(sumTime));
                console.log(sumTime);
                
                $('#result_timer').show();
            }

        };

    }
    $('body').on('click', '.delete-day', function () {
        delete_day($(this).attr('data-day'));
    });

    function delete_day(day) {
        let transaction = db.transaction("work", "readwrite");
        let work = transaction.objectStore("work");

        let request = work.openCursor(null, 'prev');


        request.onsuccess = function () {
            let cursor = request.result;
            if (cursor) {
                let key = cursor.key; // 
                let value = cursor.value; // 
                if (value.startTime.toLocaleDateString() == day) {
                    cursor.delete(key);
                }
                console.log(value.startTime.toLocaleDateString(), day);
                cursor.continue();
            } else {
                showAll();
            }
        };
    }

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? (h < 10 ? "0" : "") + h : "00";
        var mDisplay = m > 0 ? (m < 10 ? "0" : "") + m : "00";
        var sDisplay = s > 0 ? (s < 10 ? "0" : "") + s : "00";

        return hDisplay + ':' + mDisplay + ':' + sDisplay;
    }

    function getWork(db) {
        let transaction = db.transaction("work", "readwrite");
        let work = transaction.objectStore("work");

        let request = work.openCursor(null, 'prev');

        request.onsuccess = function () {
            let cursor = request.result;
            if (cursor) {
                let key = cursor.key;
                let value = cursor.value;
                if (value.stopTime == false) {
                    $('#show_all').html('<span onclick="OpenTask(null, ' + value.workId + ')"> №' + value.workId + '</span><div id="stop" data-id="' + key + '">Стоп</div>');
                    $('#popup_content').addClass('bg-red');
                }
                // console.log(key, value);
                // cursor.continue();
            } else {
                console.log("");
                $('#show_all').html('<div id="start">Старт</div>');
            }
        };
    }

    let isStatus = false;
    let statusColor = {
        '2413': '#3399CC',
        '2414': '#666699',
        '2415': '#339966',
        '2416': '#FFCC33',
        '2417': '#FF3333'
    };
    var newInterval = setInterval(function () {

        if ($("#Edit").contents().find('#SecFrame').contents().find('#ctl00_formInner_colorDialog_lstFavsFolders').length > 0) {

            if (!isStatus) {

                isStatus = true;
                let frame = $("#Edit").contents().find('#SecFrame').contents();

                // $("#Edit").contents().find('#SecFrame').contents().find('#ctl00_formInner_colorDialog_lstFavsFolders').change(function () {
                //     let color = statusColor[$(this).val()];
                //     $("#Edit").contents().find('#SecFrame').contents().find('#ctl00_formInner_colorDialog_rcpTaskColor_webPalette a').addClass('rcpColorBox').removeClass('rcpSelectedColor');

                //     $("#Edit").contents().find('#SecFrame').contents().find('#ctl00_formInner_colorDialog_rcpTaskColor_webPalette [style="background-color:' + color + ';"]').addClass('rcpSelectedColor');

                //     $("#Edit").contents().find('#SecFrame').contents().find('#ctl00_formInner_colorDialog_rcpTaskColor_ClientState').attr('value', '{"selectedColor":"' + color + '"}').trigger('change');



                // })

                setTimeout(() => {
                    frame.find('.extparamsBlock[id="1"]').css({ 'display': 'none' });
                    frame.find('.extparamsBlock[id="3"]').css({ 'display': 'none' });
                    frame.find('.extparamsBlock[id="4"]').css({ 'display': 'none' });
                    frame.find('.mainTaskFormAspx').css({ 'max-width': '99%' });



                }, 1000);

                
            }
             
        } else {
            isStatus = false;
        }

    }, 2000);



    let taskId = urlParams('task');

    if (taskId) {
        $('body').append('<span id="click-task" onclick="OpenTask(null, ' + taskId + ')"></span>');
        $('#click-task').click();
    }
    
    $('body').on('click', '.time_task', function () {
        $(this).addClass('active');
    })
    
    setTimeout(function () {
        $('.fv-item.is-task').each(function (i, el) {

            let id = $(el).attr('data-href').replace('javascript:void(OpenTask(null, ', '').replace('))', '');
            
            $(el).find('.fv-label').prepend('<span  class="id_task_menu">' + id + '</span>');
        });
    }, 2000);
});
function urlParams(key) {
    var p = window.location.search;
    p = p.match(new RegExp(key + '=([^&=]+)'));
    return p ? p[1] : false;
}

// setTimeout(() => {
//     let taskId = urlParams('task_id');
//     if (taskId) {
//         // window.OpenTask(null, taskId);
//         console.log(window);
        
//     }
// }, 10000);