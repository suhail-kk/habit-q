import moment from "moment";

// Fixed version: uses local timezone instead of UTC
export const formatRelativeDate = (date) => {
    if (!date) return "";

    const now = moment(); // local time
    const givenDate = moment(date).local(); // convert UTC → local

    if (now.isSame(givenDate, "day")) {
        return `Today, ${givenDate.format("h:mm A")}`;
    } else if (now.clone().subtract(1, "day").isSame(givenDate, "day")) {
        return `Yesterday, ${givenDate.format("h:mm A")}`;
    } else {
        return givenDate.fromNow(); // fallback: "3 days ago"
    }
};
