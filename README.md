# egg-jc2sr
egg joi controller to swagger + router

## jwt

```
// 在app.js中设置：
app.jwt = app.passport.authenticate('jwt', {session: false, successReturnToOrRedirect: null});
// 在方法中使用@Jwt修饰
```