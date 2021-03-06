import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () =>
    import ('@/components/Login')
const Home = () =>
    import ('@/components/Home')
const Welcome = () =>
    import ('@/components/Welcome')
const User = () =>
    import ('@/components/User')
const Rights = () =>
    import ('@/components/power/Rights')
const Roles = () =>
    import ('@/components/power/Roles')
const Categories = () =>
    import ('@/components/goods/Categories')

Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [{
                path: '/welcome',
                component: Welcome
            }, {
                path: '/users',
                component: User
            },
            {
                path: '/rights',
                component: Rights
            },
            {
                path: '/roles',
                component: Roles
            },
            {
                path: '/categories',
                component: Categories
            }
        ]
    }
]

const router = new VueRouter({
    routes
})
router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login');
    next();

})
export default router