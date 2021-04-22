var d = new Date();

console.log((d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear());


// Code to push an activity document to MongoDB (maintaining purpose)
// const Activity = mongoose.model("Activity", activitiesSchema);
// const activity1 = new Activity({
//      Name: "Camping",
//      ServiceProvider: "Goldenvoice",
//      Description: "Multi day outdoor experience with a music festival",
//      Rating: "5/5",
//      Date: "04/09/2021",
//      Time: "12:00 pm",
//      Image: "https://s.abcnews.com/images/Entertainment/coachella-2017-02-gty-jc-18...",
//      Venue: "Empire Polo Club",
//      Longitude: "-121.879898",
//      Latitude: "37.346792",
//      Price: 100,
//      Tags: ["camping", "outdoors", "nature", "physical"]
// });