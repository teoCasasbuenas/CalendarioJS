class Calendario {

    public startDate: any;
    public endDate: any;

    private defaultConfig: any = {
        days: [/*'Domingo', */'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'/*, 'Sábado'*/],
        shortDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dragData: 'data-id',
        draggableClass: 'dragClass'
    };
    private config: any;
    private currDate: any = new Date();
    private currDay: any = this.currDate.getDate();
    private monthHead: any;

    constructor(fechaInicio, fechaFin, config: any) {
        if (config) {
            //Configuración detectada.
            this.config = $.extend({}, this.defaultConfig, config);
            //console.log(`Configuración: `, config);
        } else {
            //Configuración no detectada.
            //console.log(`No configuración.`, $('#calendario'));
            this.config = this.defaultConfig;
        }
        this.startDate = moment(fechaInicio + "T00:00:00.000Z", "YYYY-MM-DD");
        this.endDate = moment(fechaFin + "T00:00:00.000Z", "YYYY-MM-DD");
        //console.log(moment.min(this.startDate, this.endDate) == this.startDate);
        this.init();
    }

    init() {
        //Inicia la secuencia de creación.
        let that = this,
            tempDate = moment({
                year: this.startDate.get('year'),
                month: this.startDate.get('month'),
                format: "YYYY-MM-DD"
            }),
            tempEndDate = moment({
                year: this.endDate.get('year'),
                month: this.endDate.get('month'),
                format: "YYYY-MM-DD"
            });

        this.monthHead = (function (days) {
            let weekdays = $(document.createElement('div')).addClass('calendar__weekdays');
            for (let day in days) {
                weekdays.append($(document.createElement('div')).addClass('calendar__lblday inline-block').html(days[day]));
                //console.log(days[day]);
            }
            return weekdays;
        })(this.config.days);


        while (tempDate.format('x') <= tempEndDate.format('x')) {
            this.drawMonth(tempDate.get('year'), tempDate.get('month'));
            tempDate.add(1, 'month');
        }

        this.DragEvents();


        this.RegisterEvents();
    }

    /**
     * Inicia las acciones de drag
     * @constructor
     */
    private dragOrigin;

    private DragEvents() {
        let that = this;
        $('#calendario').on('dragstart', '.' + that.config.draggableClass, function (evt) {
            evt.stopPropagation();
            var attr = $(this).attr(that.config.dragData);
            $(this).css({'cursor': 'move'});
            if (typeof attr !== typeof undefined && attr !== false) {
                evt.originalEvent.dataTransfer.setData("text", $(this).attr(that.config.dragData));
                that.dragOrigin = $(this).closest('.day');
            } else {
                return;
            }
        });
        $('#calendario').on('dragenter', '.droppable-container', function (evt) {
            $('.droppable-container').removeClass('hover');
            $(this).addClass('hover');
        });
        $('#calendario').on('dragleave', '.droppable-container', function (evt) {
        });

        $('#calendario').on('dragover', '.day', function (evt) {
            evt.preventDefault();
        });


        $('#calendario').on('click', '.more-handler', function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            let moreHand = $('<div class="calendar__dayover"><header><h4 class="lbl__fecha"></h4><i class="fa fa-close close__btn"></i></header></div>'),
                parentDay = $(this).closest('.day'),
                droppableClone = parentDay.find('.droppable-container').clone();

            droppableClone.find('.hide').each(function () {
                $(this).removeClass('hide');
            });

            $(this).closest('.calendar__monthbody').append(moreHand.append(droppableClone));

            var positionX = parentDay.get(0).offsetLeft - ((moreHand.outerWidth(true) - parentDay.outerWidth(true)) / 2),
                positionY = parentDay.get(0).offsetTop - ((moreHand.outerHeight(true) - parentDay.outerHeight(true)) / 2);

            moreHand.css({
                'left': positionX,
                'top': positionY
            }).attr({'data-yy-mm-dd': parentDay.attr('data-yy-mm-dd')}).addClass('day').find('.lbl__fecha').html(parentDay.attr('data-yy-mm-dd'));


            moreHand.on('click', '.fa-close', function () {
                moreHand.fadeOut(250, function () {
                    moreHand.remove();
                });
            });

            droppableClone.on('dragstart', '.' + that.config.draggableClass, function (evt) {
                setTimeout(function () {
                    moreHand.fadeOut(250, function () {
                        moreHand.remove();
                    });
                }, 200);

            });
        });

        $('#calendario').on('drop', '.day', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            that.checkDroppableOverflow(that.dragOrigin.find('.droppable-container').get(0));
            that.checkDroppableOverflow($(this).find('.droppable-container').get(0));
        });


    }


    RegisterEvents() {
        console.log('aqui');
        let that = this;
        // $('#calendario').on('click', '.day:not(.emptyday):not(.calendar__dayover)', function (evt){
        //     $('#calendario').trigger('dayclick');
        // });

        $('.day').on('dayclick', that.DayClick);
    }


    DayClick(e, target, fecha, callback) {
        // console.log('target', target);
        // console.log('fecha', fecha);
        // console.log('e', e);
        callback(target, fecha, e);
    }

    /**
     *
     * @param string - Define el tipo de acción que se desea atar.
     * @param callback
     */
    on(string, callback) {
        let that = this;
        if (string === 'drop') {
            $('#calendario').on('drop', '.day', function (evt) {
                evt.preventDefault();
                //TODO: Verificar los hijos que sean del mismo parent para modificar el comportamiento del drop.
                if ($(this).hasClass('prevmonth')) {
                    return;
                } else {
                    var data = evt.originalEvent.dataTransfer.getData('text');
                    $(this).find('.droppable-container').append(document.querySelector(`[${that.config.dragData}=${data}]`));
                    $(this).find(`[${that.config.dragData}=${data}]`).css({'cursor': 'pointer'});
                    $('.droppable-container').removeClass('hover');
                    callback(this, $('[' + that.config.dragData + '=' + data + ']'), $(this).attr('data-yy-mm-dd'));
                    that.checkDroppableOverflow(that.dragOrigin.find('.droppable-container').get(0));
                    that.checkDroppableOverflow($(this).find('.droppable-container').get(0));
                }
            });
        }

        if (string === 'dayclick') {
            $('#calendario').off('click').on('click', '.day:not(.emptyday):not(.calendar__dayover)', function (evt) {
                let target = this,
                    fecha = $(this).attr('data-yy-mm-dd');
                $(this).trigger('dayclick', [target, fecha, callback])
                /*'.day:not(.emptyday):not(.calendar__dayover)', function (evt) {
                                callback(this, $(this).attr('data-yy-mm-dd'), evt);*/
            });
        }
    }

    drawMonth(year, month) {
        let initDay = this.startDate.get('date'),
            daysInMonth = this.daysInMonth(year, month),
            //initWeekDay = this.startDate.format('d'),
            initWeekDay = moment({year: year, month: month, day: 1}).format('d'),
            //Templating variables.
            monthWrapper = $(document.createElement('div')).addClass('calendar__monthwrapper calendar__month').attr({'data-yy-mm': year + '-' + (month < 9 ? '0' : '') + (month + 1)}),
            monthHeader = $(document.createElement('header')),
            monthLabel = $(document.createElement('h2')).addClass('calendar__monthlabel widht100').html(this.config.months[month] + ' ' + year),
            monthWeekdays = this.monthHead.clone(),
            monthBody = $(document.createElement('div')).addClass('calendar__monthbody').attr({}),
            weekRowWrapper = $(document.createElement('div')).addClass('calendar__weekrow'),
            i = 1;


        // $('#calendario').append(monthTemplate.append(monthLabel).append(monthWeekdays));
        /*Agregamos loe elementos al monthHeader*/
        monthHeader.append(monthLabel);
        /*Agregamos los elementos al monthBody*/
        monthBody.append(monthWeekdays);
        /*Agregamos los elementos al monthWrapper*/
        monthWrapper.append(monthHeader);
        monthWrapper.append(monthBody);

        let currWeekrow = weekRowWrapper.clone(),
            weekDayControl = initWeekDay;

        while (initWeekDay > 0) {
            let emptyDate = $("<div class='inline-block prevmonth day emptyday'></div>");
            currWeekrow.addClass('font0').append(emptyDate);
            emptyDate.addClass((initWeekDay == 1 || initWeekDay == 6) ? 'hide' : '');
            initWeekDay--;
        }

        while (i <= daysInMonth) {
            let currDay = $("<div class='inline-block day" + (moment().get('date') == i && (moment().get('month') == month) ? ' today' : '') + "'><div class='dayheader'><span class='calendar__daynumber'>" + i + "</span><a class='hide inline-block more-handler' href='#'>Más</a></div><div class='droppable-container'></div></div>").attr({'data-yy-mm-dd': `${year}-${month < 9 ? '0' : ''}${(month + 1)}-${i < 10 ? '0' : ''}${i}`});
            if (weekDayControl > 6) {
                monthBody.append(currWeekrow);
                currWeekrow = weekRowWrapper.clone();
                weekDayControl = 0;
            }
            currWeekrow.append(currDay);
            currDay.addClass((weekDayControl == 0 || weekDayControl == 6) ? 'hide' : '');
            if (i == daysInMonth && weekDayControl <= 6) {
                currWeekrow.append(currDay);
                weekDayControl == currWeekrow.find('.day').length;
                while (weekDayControl > 0 && weekDayControl < 5) {
                    currWeekrow.append("<div class='inline-block nextmonth day emptyday'></div>");
                    weekDayControl++;
                }
                monthBody.append(currWeekrow);
            }
            i++;
            weekDayControl++;
        }

        $('#calendario').append(monthWrapper);

        //console.log(initDay, daysInMonth, this.startDate.get('month'));
    }

    daysInMonth(year, month) {
        month = month + 1;
        var date = new Date(year, month, 0);
        return date.getDate();
    }


    //Eventos

    /**
     *
     * @param obj
     * @param date
     */
    addObject(obj, date) {
        if (obj instanceof jQuery) {
            $('#calendario').find(`.day[data-yy-mm-dd=${date}]`).find('.droppable-container').append(obj.css({'cursor': 'pointer'}));
            this.checkDroppableOverflow($('#calendario').find(`.day[data-yy-mm-dd=${date}]`).find('.droppable-container').get(0));
        }
    }

    /**
     * Verifica si el 'droppable' tiene overflow, si es así se ocultan los elementos que no se verán y muestra la
     * cantidad en en vínculo que mostrara el conternido
     * @param el - DOM Object para verificar.
     */
    checkDroppableOverflow(el) {
        if ($(el).closest('.day').hasClass('calendar__dayover')) {
            el = $('.day[data-yy-mm-dd=' + $(el).closest('.day').attr('data-yy-mm-dd') + ']').find('.droppable-container').get(0);
        }
        $(el).closest('.day').find('a').addClass('hide');
        if ($(el).innerHeight() <= el.scrollHeight) {
            //Los elementos están ocultos en el overflow
            //TODO: Calcular los elementos ocultos para alimentar el 'más'.
            let elementsHeight = 0,
                hiddenCount = 0;
            $(el).find('> *').each(function () {
                //console.log('entra', this);
                $(this).removeClass('hide');
                elementsHeight += $(this).outerHeight(true);

                if (elementsHeight > $(el).innerHeight()) {
                    $(this).addClass('hide');
                    hiddenCount++;
                    $(el).closest('.day').find('a').removeClass('hide').html(`${hiddenCount} más`);
                }
            });
        } else {
            //console.log('Ocultar el elemento');
            $(el).closest('.day').find('a').addClass('hide');
        }
    }
}


// //Variables to be used later.  Place holders right now.
// var padding = "";
// var totalFeb = "";
// var i = 1;
// var testing = "";
//
// var current = new Date("May 13, 2018");
// var cmonth = current.getMonth();
// var day = current.getDate();
// var year = current.getFullYear();
// var tempMonth = month + 1; //+1; //Used to match up the current month with the correct start date.
// var prevMonth = month - 1;
//
// //Determing if Feb has 28 or 29 days in it.
// if (month == 1) {
//     if ((year % 100 !== 0) && (year % 4 === 0) || (year % 400 === 0)) {
//         totalFeb = 29;
//     } else {
//         totalFeb = 28;
//     }
// }
//
// //////////////////////////////////////////
// // Setting up arrays for the name of    //
// // the	months, days, and the number of	//
// // days in the month.                   //
// //////////////////////////////////////////
//
// var monthNames = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
// var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];
// var totalDays = ["31", totalFeb.toString(), "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];
//
// //////////////////////////////////////////
// // Temp values to get the number of days//
// // in current month, and previous month.//
// // Also getting the day of the week.	//
// //////////////////////////////////////////
//
// var tempDate = new Date(tempMonth + ' 1 ,' + year);
// var tempweekday = tempDate.getDay();
// var tempweekday2 = tempweekday;
// var dayAmount = totalDays[month];
// // var preAmount = totalDays[prevMonth] - tempweekday + 1;
//
// //////////////////////////////////////////////////
// // After getting the first day of the week for	//
// // the month, padding the other days for that	//
// // week with the previous months days.  IE, if	//
// // the first day of the week is on a Thursday,	//
// // then this fills in Sun - Wed with the last	//
// // months dates, counting down from the last	//
// // day on Wed, until Sunday.                    //
// //////////////////////////////////////////////////
//
// while (tempweekday > 0) {
//     padding += "<div class='premonth'></div>";
//     //preAmount++;
//     tempweekday--;
// }
//
// //////////////////////////////////////////////////
// // Filling in the calendar with the current     //
// // month days in the correct location along.    //
// //////////////////////////////////////////////////
//
// while (i <= dayAmount) {
//
//     //////////////////////////////////////////
//     // Determining when to start a new row	//
//     //////////////////////////////////////////
//
//     if (tempweekday2 > 6) {
//         tempweekday2 = 0;
//         padding += "</div><div>";
//     }
//
//     //////////////////////////////////////////////////////////////////////////////////////////////////
//     // checking to see if i is equal to the current day, if so then we are making the color of //
//     //that cell a different color using CSS. Also adding a rollover effect to highlight the  //
//     //day the user rolls over. This loop creates the acutal calendar that is displayed.		//
//     //////////////////////////////////////////////////////////////////////////////////////////////////
//
//     if (i == day && month == cmonth) {
//         padding += "<div class='inline-block' class='currentday'  onMouseOver='this.style.background=\"#00FF00\";
//                    this.style.color=\"#FFFFFF\"' onMouseOut='this.style.background=\"#FFFFFF\"; this.style.color=\"#00FF00\"'>" + i + "</div>";
//     } else {
//         padding += "<div class='currentmonth' onMouseOver='this.style.background=\"#00FF00\"' onMouseOut='this.style.background=\"#FFFFFF\"'>" + i + "</div>";
//
//     }
//
//     tempweekday2++;
//     i++;
// }
//
//
// /////////////////////////////////////////
// // Ouptputing the calendar onto the	//
// // site.  Also, putting in the month	//
// // name and days of the week.		//
// /////////////////////////////////////////
//
// // var calendarTable = "<table class='calendar'> <tr class='currentmonth'><th colspan='7'>" + monthNames[month] + " " + year + "</th></tr>";
// // calendarTable += "<tr class='weekdays'>  <td>Sun</td>  <td>Mon</td> <td>Tues</td> <td>Wed</td> <td>Thurs</td> <td>Fri</td> <td>Sat</td> </tr>";
// // calendarTable += "<tr>";
// // calendarTable += padding;
// // calendarTable += "</tr></table>";
//
// var calendarHeader = "<header>"
//     + "<div class='font0'>"
//     + "<div class='inline-block'>&lang;</div>"
//     + "<div class='inline-block'>" + monthNames[month] + "</div>"
//     + "<div class='inline-block'>&rang;</div>"
//     + "</div>"
//     + "<div class='font0'>"
//     + "<div class='inline-block'>Dom</div>"
//     + "<div class='inline-block'>Lun</div>"
//     + "<div class='inline-block'>Mar</div>"
//     + "<div class='inline-block'>Mie</div>"
//     + "<div class='inline-block'>Jue</div>"
//     + "<div class='inline-block'>Vie</div>"
//     + "<div class='inline-block'>Sab</div>"
//     + "</div>"
// "</header>";
// document.getElementById("calendar").innerHTML += calendarHeader + padding;
// }
//
// function go12() {
//     for (i = 0; i < 12; i++) {
//         calendar(i);
//     }
// }
