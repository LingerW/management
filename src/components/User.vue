<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true">
            <el-button slot="append" icon="el-icon-search" @click="queryClick"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserClick">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" stripe style="width: 100%" border>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名" align="center" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" align="center" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" align="center" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色" align="center" width="180"></el-table-column>
        <el-table-column prop="mg_state" align="center" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" @click="editClick(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" @click="delClick(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <!-- 主体 -->
      <el-form
        ref="addForm"
        :model="addUserForm"
        label-width="70px"
        class="user_form"
        :rules="addrules"
        status-icon
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <!-- <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="checkPass"></el-input>
        </el-form-item>-->
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetdialog">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" :before-close="editRest">
      <!-- 主体 -->
      <el-form
        ref="editForm"
        :model="editUserForm"
        label-width="70px"
        class="user_form"
        :rules="addrules"
        status-icon
      >
        <el-form-item prop="username" label="用户名">
          <el-input :disabled="true" v-model="editUserForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRest">取 消</el-button>
        <el-button type="primary" @click="editUserSub">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="selectRolesVisible"
      width="50%"
      :before-close="selectRest"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRole" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="selectRest">取 消</el-button>
        <el-button type="primary" @click="selectSub">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "User",
  data() {
    //自定义确认密码校验规则
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.addUserForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    var validateMobile = (rule, value, callback) => {
      //不用加引号
      const vali = /^1[3456789]\d{9}$/;
      if (value === "") {
        callback(new Error("请输入手机号"));
      } else if (!vali.test(this.addUserForm.mobile)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };
    return {
      checkPass: "",
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      //是否显示对话框
      dialogVisible: false,
      //是否修改用户对话框
      editdialogVisible: false,
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      editUserForm: {},
      //添加用户的校验规则
      addrules: {
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
          },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱地址", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur"]
          }
        ],
        checkPass: [
          { validator: validatePass, trigger: "blur" },
          {
            required: true,
            message: "确认密码必填",
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "手机号必填",
            trigger: "blur"
          },
          {
            pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
            message: "请输入正确的手机号",
            trigger: "blur"
          }
        ]
      },
      selectRolesVisible: false,
      userInfo: {},
      rolesList: [],
      selectRole: ""
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;

      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(currNum) {
      this.queryInfo.pagenum = currNum;
      this.getUserList();
    },
    async userStatusChange(user) {
      const { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      if (res.meta.status != 200) {
        user.mg_state = !user.mg_state;
        return this.$message.error("更新用户失败");
      }
      this.$message.success("更新用户成功");
    },
    queryClick() {
      this.getUserList();
    },
    //添加用户按钮
    addUserClick() {
      this.dialogVisible = !this.dialogVisible;
    },
    //关闭弹层前
    handleClose(done) {
      this.checkPass = "";
      this.$refs.addForm.resetFields();
      done();
    },
    resetdialog() {
      this.$refs.addForm.resetFields();
      this.dialogVisible = false;
    },
    addUser() {
      this.$refs.addForm.validate(async valida => {
        //校验没通过，直接返回
        if (!valida) return;
        //通过后
        const { data: res } = await this.$http.post("users", this.addUserForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        //清空表单
        this.$refs.addForm.resetFields();
        //刷新列表
        this.getUserList();
        // 关闭dialog
        this.dialogVisible = false;
      });
    },
    // 编辑用户
    editClick(user) {
      this.editUserForm = user;
      this.editdialogVisible = true;
    },
    editRest() {
      this.$refs.editForm.resetFields();
      this.editdialogVisible = false;
    },
    editUserSub() {
      this.$refs.editForm.validate(async validate => {
        if (!validate) return;
        const { data: res } = await this.$http.put(
          `users/` + this.editUserForm.id,
          this.editUserForm
        );
        if (res.meta.status !== 200) return this.$message.error("修改用户失败");
        //成功
        //1.关闭对话框
        this.editdialogVisible = false;
        this.getUserList();
        this.$message.success("修改用户成功");
      });
    },
    //删除用户
    delClick(user) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          //确定删除
          const { data: res } = await this.$http.delete(`users/` + user.id);
          if (res.meta.status !== 200) return this.$message.error("删除失败");
          //删除成功
          this.getUserList();
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //分配角色
    async setRoles(userInfo) {
      this.userInfo = userInfo;
      //获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
      this.selectRolesVisible = true;
    },
    selectRest() {
      this.userInfo = {};
      this.selectRole='';
      this.selectRolesVisible = false;
    },
  async selectSub() {
      if(!this.selectRole) return this.$message.error('请选择要分配的角色');
      const{data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRole});
      if(res.meta.status!==200) return this.$message.error('更新角色失败'); 
      this.$message.success('更新角色成功'); 
      this.selectRolesVisible = false;
      this.getUserList();
    }
  }
};
</script>
<style scoped>
</style>