var urls = [
    { path: "/", authorize: false },
    { path: "/ping", authorize: false },
    { path: "/auth/login", auauthorizeth: false },
    { path: "/auth", authorize: true },
    { path: "/user", authorize: true },
    { path: "/course", authorize: true },
    { path: "/batch", authorize: true },
    { path: "/leads", authorize: true },
];

module.exports = urls;