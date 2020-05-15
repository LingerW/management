<template>
  <div class="login_container">
    <div class="login_box">
      <div class="img_box">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form ref="from" :model="loginForm" class="login_form" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="loginClick">登录</el-button>
          <el-button type="info" @click="restClick">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      rules: {
        username: [
          {
            required: true,
            message: "用户名必填",
            trigger: "blur"
          },
          {
            min: 3,
            max: 6,
            message: "长度在 3 到 6 个字符",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "密码必填",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    restClick() {
      this.$refs.from.resetFields();
    },
    loginClick() {
      this.$refs.from.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        //打印的是promise对象，想要直接获取data数据，使用这种方式
        //登录失败
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        //登录成功
        this.$message.success("登录成功");
        //1.保存token值，项目中处理登录共功能以外都需要携带token才能访问
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    }
  }
};
</script>
<style scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.img_box {
  width: 130px;
  height: 130px;
  padding: 10px;
  border-radius: 50%;
  border: 1px solid #eee;
  box-shadow: 0 0 10px #ddd;
  background-color: #fff;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
.img_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>