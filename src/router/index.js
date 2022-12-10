import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../views/Login/Login";
import SignUp from "../views/Login/SignUp";
import ForgotPassword from "../views/Login/ForgotPassword";
import Home from '../views/Home/Home.vue'
import News from "../views/News/News";
import firebase from "firebase/app";
import Schedule from "../views/Schedule/Schedule";
import NewDetails from "../views/News/NewDetails";
import ScheduleDetails from "../views/Schedule/ScheduleDetails";
import Teams from "../views/Teams/Teams";
import MyNews from "../views/News/MyNews";
import TeamDetails from "../views/Teams/TeamDetails";
import Drivers from "../views/Drivers/Drivers";
import Table from "../views/Table/Table";
import Forum from "../views/Forum/Forum";
import Profile from "../views/Profile/Profile";
import Comments from "../views/Forum/Comments";
import MyForum from "../views/Forum/MyForum";
import Vote from "../views/Vote/Vote";
import DriverDetails from "../views/Drivers/DriverDetails";
import AllVotes from "../views/Vote/AllVotes";
import VoteResults from "../views/Vote/VoteResults";
import EditSchedule from "../views/Schedule/EditSchedule";
import EditTeams from "../views/Teams/EditTeams";
import EditDrivers from "../views/Drivers/EditDrivers";

Vue.use(VueRouter);

const routes = [
  {
    path: '*',            // Redirect every paths that does not exist to the Login view
    redirect: 'Login',
  },
  {
    path: '/',
    redirect: 'Login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },

  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/news/new-details/:id',
    name: 'new-details',
    component: NewDetails,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/my-news',
    name: 'MyNews',
    component: MyNews,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/schedule/schedule-details/:id',
    name: 'schedule-details',
    component: ScheduleDetails,
    meta: {
        requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/edit-schedule',
    name: 'EditSchedule',
    component: EditSchedule,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/teams',
    name: 'Teams',
    component: Teams,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/teams/team-details/:id',
    name: 'team-details',
    component: TeamDetails,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/edit-teams',
    name: 'EditTeams',
    component: EditTeams,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/drivers',
    name: 'Drivers',
    component: Drivers,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/drivers/driver-details/:id',
    name: 'driver-details',
    component: DriverDetails,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/edit-drivers',
    name: 'EditDrivers',
    component: EditDrivers,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: Forum,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/my-forum',
    name: 'MyForum',
    component: MyForum,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/forum/comments/',
    name: 'comments',
    component: Comments,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    },
  },
  {
    path: '/vote',
    name: 'Vote',
    component: Vote,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/all-votes',
    name: 'AllVotes',
    component: AllVotes,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/all-votes/vote-results/',
    name: 'vote-results',
    component: VoteResults,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/table',
    name: 'Table',
    component: Table,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true    // Users need to be authentication to enter at this page
    }
  },
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {      // This method is called whenever a navigation is triggered.
  const currentUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) next('login');      // User not authenticated
  else if (!requiresAuth && currentUser) next('home');  // User authenticated
  else next();
});

export default router
