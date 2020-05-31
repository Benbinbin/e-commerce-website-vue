<template>
  <div>
    <!-- 使用模块 vue-loading-overlay 在读取数据时页面会出现加载指示 -->
    <!-- https://github.com/ankurk91/vue-loading-overlay -->
    <loading :active.sync="isLoading"></loading>
    <div class="text-right mt-4">
      <button type="button" class="btn btn-primary text-white" @click="openModal(true)">建立新的产品</button>
    </div>
    <table class="table mt-4">
      <thead>
        <tr>
          <th width="120">分类</th>
          <th>产品名称</th>
          <th width="120">原价</th>
          <th width="120">售价</th>
          <th width="100">是否开售</th>
          <th width="120">编辑</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in products" :key="item.id">
          <td>{{ item.category }}</td>
          <td>{{ item.title }}</td>
          <td class="text-right">{{ item.origin_price | currency }}</td>
          <td class="text-right">{{ item.price | currency }}</td>
          <td class="text-right">
            <span v-if="item.is_enabled">开售</span>
            <span v-else>未开售</span>
          </td>
          <td>
            <div class="btn-group" role="group" aria-label="Basic example">
              <button class="btn btn-outline-primary btn-sm" @click="openModal(false, item)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="openDeleteModal(item)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <Pagination :pagination="pagination" @changePage="getProducts"></Pagination>

    <!-- Product Modal -->
    <div
      class="modal fade"
      id="productModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content border-0">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title" id="exampleModalLabel">
              <span>新增商品</span>
            </h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="text-white">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-sm-4">
                <div class="form-group">
                  <label for="image">输入图片网址</label>
                  <input
                    type="text"
                    class="form-control"
                    id="image"
                    placeholder="请输入图片 链接"
                    v-model="tempProduct.imageUrl"
                  />
                </div>
                <div class="form-group">
                  <label for="customFile">
                    或 上传图片
                    <i class="fas fa-spinner fa-spin" v-if="status.fileUploading"></i>
                  </label>
                  <input
                    type="file"
                    id="customFile"
                    class="form-control"
                    ref="files"
                    @change="uploadFile"
                  />
                </div>
                <img :src="tempProduct.imageUrl" class="img-fluid" v-if="tempProduct.imageUrl" />
              </div>
              <div class="col-sm-8">
                <div class="form-group">
                  <label for="title">标题</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    placeholder="请输入标题"
                    v-model="tempProduct.title"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label for="category">分类</label>
                    <input
                      type="text"
                      class="form-control"
                      id="category"
                      placeholder="请输入分类"
                      v-model="tempProduct.category"
                    />
                  </div>
                  <div class="form-group col-md-6">
                    <label for="price">单位</label>
                    <input
                      type="unit"
                      class="form-control"
                      id="unit"
                      placeholder="请输入单位"
                      v-model="tempProduct.unit"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label for="origin_price">原价</label>
                    <input
                      type="number"
                      class="form-control"
                      id="origin_price"
                      placeholder="请输入原价"
                      v-model="tempProduct.origin_price"
                    />
                  </div>
                  <div class="form-group col-md-6">
                    <label for="price">售价</label>
                    <input
                      type="number"
                      class="form-control"
                      id="price"
                      placeholder="请输入售价"
                      v-model="tempProduct.price"
                    />
                  </div>
                </div>
                <hr />

                <div class="form-group">
                  <label for="description">产品描述</label>
                  <textarea
                    type="text"
                    class="form-control"
                    id="description"
                    placeholder="请输入产品描述"
                    v-model="tempProduct.description"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label for="content">说明内容</label>
                  <textarea
                    type="text"
                    class="form-control"
                    id="content"
                    placeholder="请输入产品说明内容"
                    v-model="tempProduct.content"
                  ></textarea>
                </div>
                <div class="form-group">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="is_enabled"
                      v-model="tempProduct.is_enabled"
                      :true-value="1"
                      :false-value="0"
                    />
                    <label class="form-check-label" for="is_enabled">是否开售</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="updateProduct">确认</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Delete Modal -->
    <div
      class="modal fade"
      id="delProductModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="exampleModalLabel">
              <span>删除产品</span>
            </h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="text-white">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            是否删除
            <strong class="text-danger">{{ tempProduct.title }}</strong> 商品（删除后将无法恢复）。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="deleteProduct">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 在 Vue 中需要使用 jquery 功能（如 $ 别名）需要将其导入
import $ from "jquery";
import Pagination from '@/components/Pagination';

export default {
  data() {
    return {
      products: [],
      pagination: {},
      tempProduct: {},
      isNew: false,
      isLoading: false,
      status: {
        fileUploading: false,
      },
    };
  },
  methods: {
    getProducts(page = 1) {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/products?page=${page}`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.products = response.data.products;
        vm.pagination = response.data.pagination;
        vm.isLoading = false;
      });
    },
    openModal(isNew, item) {
      if (isNew) {
        // 模态框中的商品是新增的商品
        this.tempProduct = {};
        this.isNew = true;
      } else {
        // 模态框中的商品是已存在的商品
        // 浅拷贝 item 商品对象到 tempProduct
        this.tempProduct = Object.assign({}, item);
        this.isNew = false;
      }
      $("#productModal").modal("show");
    },
    updateProduct() {
      const vm = this;
      let api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/product`;
      let httpMethod = "post";
      if (!vm.isNew) {
        api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/product/${vm.tempProduct.id}`;
        httpMethod = "put";
      }

      this.$http[httpMethod](api, { data: vm.tempProduct }).then(response => {
        console.log(response.data);
        if (response.data.success) {
          $("#productModal").modal("hide");
          vm.getProducts();
        } else {
          $("#productModal").modal("hide");
          vm.getProducts();
          console.log("新增商品失败");
        }
      });
    },
    openDeleteModal(item) {
      const vm = this;
      vm.tempProduct = item;
      $("#delProductModal").modal("show");
    },
    deleteProduct() {
      const vm = this;
      let api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/product/${vm.tempProduct.id}`;
      this.$http.delete(api).then(response => {
        console.log(response.data);
        if (response.data.success) {
          $("#delProductModal").modal("hide");
          vm.getProducts();
        } else {
          $("#delProductModal").modal("hide");
          vm.getProducts();
          console.log("删除商品失败");
        }
      });
    },
    uploadFile() {
      // console.log(this);
      const vm = this;
      vm.status.fileUploading = true;
      let uploadedFile = this.$refs.files.files[0];
      let formData = new FormData();
      formData.append("file-to-upload", uploadedFile);
      let url = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/upload`;
      this.$http.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          console.log(response.data);
          vm.status.fileUploading = false;
          if (response.data.success) {
            vm.$set(vm.tempProduct, "imageUrl", response.data.imageUrl);
          } else {
            this.$bus.$emit('messagePush', response.data.message, 'danger');
          }
        });
    },
  },
  created() {
    this.getProducts();
  },
  components: {
    'Pagination': Pagination,
  }
};
</script>