<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary">添加角色</el-button>
      <!-- 列表 -->
      <el-table :data="rolesList" stripe style="width: 100%" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 渲染一级 -->
            <el-row
              :class="{bdbottom:true,bdtop:l1==0,vcenter:true}"
              v-for="(item,l1) in scope.row.children"
              :key="item.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightChild(scope.row.id,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级 -->
                <el-row
                  :class="{bdtop:l2==0,bdbottom:item.children.length-1!=l2,vcenter:true}"
                  v-for="(item1,l2) in item.children"
                  :key="item1.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightChild(scope.row.id,item1.id)"
                    >{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级级 -->
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item2) in item1.children"
                      :key="item2.id"
                      @close="removeRightChild(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showSetRoleDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限dialog -->
    <el-dialog title="分配权限" :visible.sync="setRolesDialogVisible" width="50%" @close="restRolesDialog">
      <el-tree
        :default-checked-keys="checkedKeys"
        :data="rolesTreeList"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="restRolesDialog()">取 消</el-button>
        <el-button type="primary" @click="setRolesDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      setRolesDialogVisible: false,
      rolesTreeList: [],
      defaultProps: {
        label: "authName",
        children: "children"
      },
      checkedKeys:[]
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.rolesList = res.data;
    },
    //删除标签
    removeRightChild(role, rightId) {
      this.$confirm("此操作将删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/` + role.id + `/rights/` + rightId
          );
          if (res.meta.status !== 200)
            return this.$message.error("取消权限失败");
          //刷新界面
          role.children = res.data;
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
    //分配权限
    async showSetRoleDialog(user) {
      //查询所有的权限
      const { data: res } = await this.$http.get(`rights/tree`);
      if (res.meta.status !== 200) return this.$message.error("获取权限失败");
      this.rolesTreeList = res.data;
      this.getUserRoles(user,this.checkedKeys);

      this.setRolesDialogVisible = true;
    },
    //递归获取每个角色的权限
    getUserRoles(user,arr){
      if(!user.children) return arr.push(user.id);
      user.children.forEach(item=>{
       this.getUserRoles(item,arr);
      });
    },
    restRolesDialog(){
      this.checkedKeys=[];
       this.setRolesDialogVisible = false
    }
  }
};
</script>
<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>