function getLearnerData(course, ag, submissions) {
    const result = [];

    // Check if the assignment group belongs to the correct course
    if (ag.course_id !== course.id) {
      throw new Error("Assignment group does not belong to the provided course.");
    }

    const learnerData = {};

    // Process each submission
    submissions.forEach((submission) => {
      try {
        const { learner_id, assignment_id, submission: sub } = submission;
        const assignment = ag.assignments.find(a => a.id === assignment_id);

        if (!assignment) {
          throw new Error(`Assignment with ID ${assignment_id} not found.`);
        }

        const dueDate = new Date(assignment.due_at);
        const submittedDate = new Date(sub.submitted_at);

        // Ignore assignments that are not yet due
        if (submittedDate < dueDate) {
          return;
        }

        let score = sub.score;

        // Handle late submissions
        if (submittedDate > dueDate) {
          const penalty = assignment.points_possible * 0.1;
          score = Math.max(score - penalty, 0); // Avoid negative scores
        }

        // Calculate percentage
        const percentage = score / assignment.points_possible;

        // Initialize learner data if not present
        if (!learnerData[learner_id]) {
          learnerData[learner_id] = {
            id: learner_id,
            avg: 0,
            totalPoints: 0,
            weightedPoints: 0,
            assignments: {},
          };
        }

        // Record data for the assignment
        learnerData[learner_id].assignments[assignment_id] = percentage;
        learnerData[learner_id].weightedPoints += score;
        learnerData[learner_id].totalPoints += assignment.points_possible;

      } catch (err) {
        console.warn(`Problem processing submission: ${err.message}`);
      }
    });

    // Finalize learner averages and structure the result
    Object.keys(learnerData).forEach((learnerId) => {
      const learner = learnerData[learnerId];
      learner.avg = (learner.weightedPoints / learner.totalPoints).toFixed(2);
      delete learner.weightedPoints; // Clean up unnecessary data
      delete learner.totalPoints; // Keep the object focused
      result.push(learner);
    });

    return result;
  }

  // Test Data
  const CourseInfo = {
    id: 451,
    name: "Introduction to JavaScript"
  };

  const AssignmentGroup = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [
      {
        id: 1,
        name: "Declare a Variable",
        due_at: "2023-01-25",
        points_possible: 50
      },
      {
        id: 2,
        name: "Write a Function",
        due_at: "2023-02-27",
        points_possible: 150
      },
      {
        id: 3,
        name: "Code the World",
        due_at: "3156-11-15",
        points_possible: 500
      }
    ]
  };

  const LearnerSubmissions = [
    {
      learner_id: 125,
      assignment_id: 1,
      submission: {
        submitted_at: "2023-01-25",
        score: 47
      }
    },
    {
      learner_id: 125,
      assignment_id: 2,
      submission: {
        submitted_at: "2023-02-12",
        score: 150
      }
    },
    {
      learner_id: 125,
      assignment_id: 3,
      submission: {
        submitted_at: "2023-01-25",
        score: 400
      }
    },
    {
      learner_id: 132,
      assignment_id: 1,
      submission: {
        submitted_at: "2023-01-24",
        score: 39
      }
    },
    {
      learner_id: 132,
      assignment_id: 2,
      submission: {
        submitted_at: "2023-03-07",
        score: 140
      }
    }
  ];

  // Test the function
  const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
  console.log(result);




