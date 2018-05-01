
const dayComponent = {   
    props:["day", "month", "items"],
    template:"<div v-bind:class='[dayColor, day]'>" + 
        "<small>{{formatedDay}}</small><br />" +
        "<span>{{totalDuration}}</span>" +
        "</div>",
    computed: {
        formatedDay: function(){
            return moment(this.day).format("DD.MM.");
        },
        dayColor: function() {
            if (this.day.month() !== this.month) { return ''; }
            else if (this.totalDuration < 3.5) { return "green"; }
            else if (this.totalDuration < 5.5) { return "yellow"; }
            else { return "red"; }
        },

        totalDuration: function() {
            if (this.items === undefined) { return 0.0; };
            return this.items.reduce((total, item) => {
                var returnValue = 0.0;
                switch (item.type) {
                    case "task":
                        returnValue = 2.5;
                        break;
                    case "appointment":
                        returnValue = moment(item.endTime).diff(moment(item.startTime), "minutes") / 60;
                        break;
                }
                return total + returnValue;
            }, 0.0)
        }
    }
}


const weekComponent = {   
    components: {
        "day": dayComponent
    },
    props:["weekNumber", "monthNumber", "items"],
    template:"<div class='week'>" + 
        "<div class='weekno'>KW {{weekNumber}}</div>" +
        "<day v-for='day in days' :key='day.dayOfYear()' v-bind:day='day'v-bind:month='monthNumber' v-bind:items='dayItems[day.dayOfYear()]'></day>" +
        "</div>",
    computed: {
        days: function() {
            return [...Array(7).keys()].
                map((dayOffset) => moment().
                    isoWeek(this.weekNumber).
                    startOf("isoWeek").
                    add(dayOffset, "d"))
        },
        dayItems: function() {
            if (this.items === undefined) { return []; };
            return this.items.
                reduce((total, item) => {
                    const itemDay = moment(item.startTime).dayOfYear();
                    if (total[itemDay] == undefined) { total[itemDay] = []; };
                    total[itemDay].push(item);
                    return total;
                }, []);
        }
    }
}

const monthComponent = {
    props:["monthNumber", "items"],
    components: {
        "week": weekComponent
    },
    template:"<div class='month'>" + 
        "<h2>{{monthName}}</h2>" + 
        "<div v-for='week in weeks'><week v-bind:week-number='week' v-bind:month-number='monthNumber' v-bind:items='weekItems[week]'></week></div>" +
        "</div>",
    
    computed: {
        monthName: function() {
            return moment().month(this.monthNumber).startOf("month").format("MMMM");
        }, 
        weeks: function() {
            return [...Array(6).keys()].
                map((weekOffset) => moment().month(this.monthNumber).startOf("month").add(weekOffset, "w").isoWeek()).
                filter((weekno) => moment().isoWeek(weekno).startOf("isoWeek").month() === this.monthNumber || 
                    moment().isoWeek(weekno).endOf("isoWeek").month() === this.monthNumber)
        },
        weekItems: function() {
            if (this.items === undefined) { return []; };
            return this.items.
                reduce((total, item) => {
                    const itemWeek = moment(item.startTime).isoWeek();
                    if (total[itemWeek] == undefined) { total[itemWeek] = []; };
                    total[itemWeek].push(item);
                    return total;
                }, []);
        }
    },
    
}


var kanban = new Vue({
    el: '#kanban',
    components: {
        "month-component" : monthComponent
    },
    data: {
        items: [
            {id:1, name: "Item1", type:"task", startTime: "2018-04-01T00:00:00", endTime: "2018-04-01T00:00:00"},
            {id:3, name: "Item3", type:"task", startTime: "2018-04-01T00:00:00", endTime: "2018-04-01T00:00:00"},
            {id:2, name: "Item2", type:"appointment", startTime: "2018-04-01T10:45:00", endTime: "2018-04-01T11:30:00"}
        ],
        monthCount : 3,
        monthOffset : -1    
    },
    computed: {
        months: function () { 
            return [...Array(3).keys()].
                map((item) => moment().add((item + this.monthOffset),"M").month()) 
        },
        monthItems: function() {
            if (this.items === undefined) { return []; };
            return this.items.
                reduce((total, item) => {
                    const itemMonth = moment(item.startTime).month();
                    if (total[itemMonth] == undefined) { total[itemMonth] = []; };
                    total[itemMonth].push(item);
                    return total;
                }, []);
        }
    }
  })


    function drag(ev) {
        ev.dataTransfer.setData("ElementId", ev.target.id);
    }
    
    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drop(ev) {
        ev.preventDefault();
        var ElementId = ev.dataTransfer.getData("ElementId");
        ev.target.appendChild(document.getElementById(ElementId));
    }
