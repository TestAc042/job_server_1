const express = require("express");
const router = express.Router();
// const { updateUser } = require("../models/user");

const users = require("./users_2");
const usersData = users["users"];

const mongoURI =
  "mongodb+srv://testac042:qrBNlA5NMpGYDm3h@testleet.y9jtdbz.mongodb.net/?retryWrites=true&w=majority";
const dbName = "student";
const collectionName = "users_2";
const logCollectionName = "log";
const apiUrl = "https://queryservertest.onrender.com/sendRequest";
const apiHeaders = { "Content-Type": "application/json" };

const mongoClient = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// app.get("/", async (req, res) => {
//   try {
//     res.status(200).send("Ok I am awake");
//     // console.log("Wake up sid");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.get("/", async (req, res) => {});

router.get("/", async (req, res) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    const logcollection = db.collection(logCollectionName);

    let userCount = 0;

    for (const userInstance of usersData) {
      // if (userCount == 5001) break;
      userCount++;
      // console.log(userCount);
      // console.log(userInstance);

      let graphqlQuery = {
        username: userInstance,
        query: `query CombinedUserProfileQuery($username: String!, $year: Int) {\n  matchedUser(username: $username) {\n    # User Public Profile\n\n    username\n\n    profile {\n      ranking\n      realName\n     userAvatar\n    }\n\n    # Skill Stats\n    tagProblemCounts {\n      advanced {\n        tagName\n        tagSlug\n        problemsSolved\n      }\n      intermediate {\n        tagName\n        tagSlug\n        problemsSolved\n      }\n      fundamental {\n        tagName\n        tagSlug\n        problemsSolved\n      }\n    }\n\n    # User Problems Solved\n    problemsSolvedBeatsStats {\n      difficulty\n      percentage\n    }\n    submitStatsGlobal {\n      acSubmissionNum {\n        difficulty\n        count\n      }\n    }\n\n    # User Profile Calendar\n    userCalendar(year: $year) {\n      activeYears\n      streak\n      totalActiveDays\n      submissionCalendar\n    }\n  }\n\n  # User Contest Ranking Info - CONTEST \n  userContestRanking(username: $username) {\n    attendedContestsCount\n    rating\n    globalRanking\n    totalParticipants\n    topPercentage\n    badge {\n      name\n    }\n  }\n  userContestRankingHistory(username: $username) {\n    attended\n    trendDirection\n    problemsSolved\n    totalProblems\n    finishTimeInSeconds\n    rating\n    ranking\n    contest {\n      title\n      startTime\n    }\n  }\n}\n`,
        vars: {
          username: userInstance,
        },
      };

      let response;
      // let beep;
      try {
        // beep = await axios.get("https://schedulertestserver.onrender.com/")
        response = await axios.post(apiUrl, graphqlQuery, {
          headers: apiHeaders,
        });
      } catch (e) {
        // console.log(userInstance, "----- SKIPPED -----", e);
        await logcollection.updateOne(
          { user: userInstance },
          {
            $set: {
              error_type: "user_ins_json_parse",
              error_message: "ERROR - json parsing",
            },
          },
          { upsert: true }
        );
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        // console.error("Invalid HTTP status code:", response.status);

        await logcollection.updateOne(
          { user: userInstance },
          {
            $set: {
              error_type: "http_error",
              error_message: `ERROR - http error - ${response.status}`,
            },
          },
          { upsert: true }
        );
        continue;
      }

      let userData = response.data;

      if ("error" in userData) {
        // console.log("ERROR - internal server error", "--- SKIPPED ----");
        await logcollection.updateOne(
          { user: userInstance },
          {
            $set: {
              error_type: "user_ins_error",
              error_message: "ERROR - internal server error",
            },
          },
          { upsert: true }
        );
        continue;
      }
      if ("errors" in userData) {
        // console.log("ERROR - user not found", "--- SKIPPED ----");
        await logcollection.updateOne(
          { user: userInstance },
          {
            $set: {
              error_type: "user_ins_invalid",
              error_message: "ERROR - user not found",
            },
          },
          { upsert: true }
        );
        continue;
      }

      // Extract and process the user information here as in your Python code
      // ...

      const userInfo = userData; // This should be your actual userInfo object from response
      const username = userInstance; // Replace with actual username

      const lc_id = userInfo.data.matchedUser.username;
      const real_name = userInfo.data.matchedUser.profile.realName;
      const tagProblemCounts = userInfo.data.matchedUser.tagProblemCounts;
      const totalProblemCounts =
        userInfo.data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count;
      const hardProblemCounts =
        userInfo.data.matchedUser.submitStatsGlobal.acSubmissionNum[1].count;
      const mediumProblemCounts =
        userInfo.data.matchedUser.submitStatsGlobal.acSubmissionNum[2].count;
      const easyProblemCounts =
        userInfo.data.matchedUser.submitStatsGlobal.acSubmissionNum[3].count;
      const heatMap = userInfo.data.matchedUser.userCalendar.submissionCalendar;
      const lastContest =
        userInfo.data.userContestRankingHistory[
          userInfo.data.userContestRankingHistory.length - 1
        ];

      const user_avatar = userInfo.data.matchedUser.profile.userAvatar;

      const q_ranking = userInfo.data.matchedUser.profile.ranking;
      let g_ranking = "None";
      let contest_attended = 0;
      if (userInfo.data.userContestRanking) {
        contest_attended =
          userInfo.data.userContestRanking.attendedContestsCount;
        g_ranking = userInfo.data.userContestRanking.globalRanking;
      }

      // console.log(q_ranking + " " + g_ranking);

      // Generate random data
      const regNo = `20BCE${Math.floor(Math.random() * 899999) + 100000}`;
      const uniEmail = `${lc_id.toLowerCase()}@vitbhopal.ac.in`;
      const email = `${lc_id.toLowerCase()}@gmail.com`;
      const cgpa = (Math.random() * 4 + 6).toFixed(2);
      const class10 = (Math.random() * 5 + 5).toFixed(2);
      const class12 = Math.floor(Math.random() * 51 + 50);
      const year = Math.floor(Math.random() * 8 + 2016).toString();
      const arrear = Math.random() < 0.5 ? "yes" : "no";
      const backlog = Math.floor(Math.random() * 6).toString();
      const yearGap = Math.floor(Math.random() * 4).toString();

      // Construct new JSON format
      let topics = {};
      for (const key in tagProblemCounts) {
        tagProblemCounts[key].forEach((item) => {
          topics[item.tagSlug] = item.problemsSolved.toString();
        });
      }

      const newFormat = {
        info: {
          lc_id: lc_id,
          Reg_no: regNo,
          user_avatar: user_avatar,
          uni_email: uniEmail,
          email: email,
          real_name: real_name,
          CGPA: cgpa,
          10: class10,
          12: class12,
          Branch: "CSE",
          Degree: "B.Tech",
          year: year,
          arrear: arrear,
          backlog: backlog,
          year_gap: yearGap,
          q_ranking: q_ranking,
          g_ranking: g_ranking,
          contest_attended: contest_attended,
        },
        Questions: {
          Total: totalProblemCounts,
          easy: easyProblemCounts,
          medium: mediumProblemCounts,
          hard: hardProblemCounts,
          topics: topics,
        },
        HeatMap: {
          map: heatMap,
        },
        LastContest: {
          title: lastContest.contest.title,
          attended: lastContest.attended,
          problemsSolved: lastContest.problemsSolved,
          totalProblems: lastContest.totalProblems,
          rating: lastContest.rating,
          ranking: lastContest.ranking,
          startTime: lastContest.contest.startTime,
        },
      };

      await collection.updateOne(
        { user: username },
        { $set: { data: newFormat } },
        { upsert: true }
      );
    }

    res.send("User data updated");
    console.log("Successfully executed for ", userCount);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  } finally {
    mongoClient.close();
  }
});

module.exports = router;
