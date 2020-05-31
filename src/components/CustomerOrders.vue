<template>
  <div>
    <loading :active.sync="isLoading"></loading>
    <div class="container">
      <div class="row mt-4">
        <div class="col-md-4 mb-4" v-for="item in products" :key="item.id">
          <div class="card border-0 shadow-sm h-100">
            <div
              style="height: 350px; background-size: cover; background-position: center"
              :style="{backgroundImage: `url(${item.imageUrl})`}"
            >
              <span class="badge badge-success float-right mr-3 mt-3 p-2">{{ item.category }}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">
                <a href="#" class="text-dark">{{ item.title }}</a>
              </h5>
              <div class="d-flex justify-content-between align-items-baseline">
                <div class="h5" v-if="!item.price">售价 {{ item.origin_price }} 元</div>
                <del class="h6" v-if="item.price">原价 {{ item.origin_price }} 元</del>
                <div class="h5" v-if="item.price">售价 {{ item.price }} 元</div>
              </div>
            </div>
            <div class="card-footer d-flex">
              <!-- Button trigger product modal -->
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                @click="getProduct(item.id)"
              >
                <i class="fas fa-spinner fa-spin" v-if="status.loadingItem == item.id"></i>
                查看更多
              </button>
              <button
                type="button"
                class="btn btn-primary btn-sm ml-auto"
                @click="addToCart(item.id)"
              >
                <i class="fas fa-spinner fa-spin" v-if="status.loadingItem == item.id"></i>
                加入购物车
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Pagination :pagination="pagination" @changePage="getProducts"></Pagination>

    <!-- Product Modal -->
    <div
      class="modal fade"
      id="productModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="introduction"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title" id="introductionLabel">{{ product.title }}</h1>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <img :src="product.imageUrl" class="img-fluid mx-auto d-block" alt="product image" />

            <div class="h3 my-3">商品描述</div>
            <hr />
            <div v-html="product.description"></div>
            <div class="h3 my-3">内容</div>
            <hr />
            <div v-html="product.content"></div>
            <div class="h3 my-3">选购</div>
            <hr />
            <div class="d-flex justify-content-between align-items-baseline">
              <div class="h4" v-if="!product.price">售价 {{ product.origin_price }} 元</div>
              <del class="h6" v-if="product.price">原价 {{ product.origin_price }} 元</del>
              <div class="h4" v-if="product.price">售价 {{ product.price }} 元</div>
            </div>
            <select name class="form-control mt-3" id v-model="product.num">
              <option :value="num" v-for="num in 10" :key="num">选购 {{ num }} {{product.unit}}</option>
            </select>
          </div>
          <div class="modal-footer">
            <div class="text-muted text-nowrap mr-3">
              小计
              <strong>{{ product.num * product.price }}</strong> 元
            </div>
            <button
              type="button"
              class="btn btn-primary"
              @click="addToCart(product.id, product.num)"
            >
              <i class="fas fa-spinner fa-spin" v-if="status.loadingItem == product.id"></i>
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart List -->
    <table class="table mt-4">
      <thead>
        <tr>
          <th width="80"></th>
          <th>产品名称</th>
          <th width="120">数量</th>
          <th width="120">单价</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in carts" :key="item.id">
          <td>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm"
              @click="removeCartItem(item.id)"
            >
              <i class="far fa-trash-alt"></i>
            </button>
          </td>
          <td>
            {{ item.product.title }}
            <span class="badge badge-success p-2" v-if="item.coupon">已使用优惠券</span>
          </td>
          <td class="text-right">{{ item.qty }}/{{ item.product.unit }}</td>
          <td class="text-right">{{ item.product.price | currency }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="text-right font-weight-bold">
          <td colspan="3">总计</td>
          <td>{{ total | currency }}</td>
        </tr>
        <tr class="text-right text-success" v-if="final_total !== total">
          <td colspan="3" class="text-right">折后价</td>
          <td class="text-right">{{ final_total | currency }}</td>
        </tr>
      </tfoot>
    </table>
    <div class="input-group mb-3 input-group-sm">
      <input type="text" class="form-control" placeholder="请输入优惠码" v-model="coupon_code" />
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" @click="addCouponCode">使用优惠码</button>
      </div>
    </div>

    <!-- Submit Order -->
    <!-- use vee validate -->
    <!-- https://github.com/logaretm/vee-validate/tree/v2 -->
    <div class="my-5 row justify-content-center">
      <form class="col-md-6" @submit.prevent="createOrder">
        <div class="form-group">
          <label for="useremail">Email</label>
          <input
            type="email"
            class="form-control"
            :class="{'is-invalid': errors.has('email')}"
            name="email"
            id="useremail"
            v-model="form.user.email"
            v-validate="'required|email'"
            placeholder="请输入 Email"
          />
          <span class="text-danger" v-if="errors.has('email')">{{ errors.first('email') }}</span>
        </div>

        <div class="form-group">
          <label for="username">收件人姓名</label>
          <input
            type="text"
            class="form-control"
            :class="{'is-invalid': errors.has('name')}"
            name="name"
            id="username"
            v-model="form.user.name"
            v-validate="'required'"
            placeholder="输入姓名"
          />
          <span class="text-danger" v-if="errors.has('name')">必须输入姓名</span>
        </div>

        <div class="form-group">
          <label for="usertel">收件人电话</label>
          <input
            type="tel"
            class="form-control"
            :class="{'is-invalid': errors.has('telephone')}"
            name="telephone"
            id="usertel"
            v-model="form.user.tel"
            v-validate="'required'"
            placeholder="请输入电话"
          />
          <span class="text-danger" v-if="errors.has('telephone')">必须输入电话</span>
        </div>

        <div class="form-group">
          <label for="useraddress">收件人地址</label>
          <input
            type="text"
            class="form-control"
            :class="{'is-invalid': errors.has('address')}"
            name="address"
            id="useraddress"
            v-model="form.user.address"
            v-validate="'required'"
            placeholder="请输入地址"
          />
          <span class="text-danger" v-if="errors.has('address')">必须输入地址</span>
        </div>

        <div class="form-group">
          <label for="comment">留言</label>
          <textarea
            name
            id="comment"
            class="form-control"
            cols="30"
            rows="10"
            v-model="form.message"
          ></textarea>
        </div>
        <div class="text-right">
          <button class="btn btn-danger">发送订单</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination";
// 在 Vue 中需要使用 jquery 功能（如 $ 别名）需要将其导入
import $ from "jquery";

export default {
  data() {
    return {
      products: [],
      product: {},
      carts: [],
      final_total: 0,
      total: 0,
      coupon_code: "",
      pagination: {},
      status: {
        loadingItem: ""
      },
      isLoading: false,
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: ""
        },
        message: ""
      }
    };
  },
  methods: {
    getProducts(page = 1) {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/products?page=${page}`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.products = response.data.products;
        vm.pagination = response.data.pagination;
        vm.isLoading = false;
      });
    },
    getProduct(id) {
      const vm = this;
      vm.status.loadingItem = id;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/product/${id}`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.product = response.data.product;
        $("#productModal").modal("show");
        vm.status.loadingItem = "";
      });
    },
    addToCart(id, qty = 1) {
      const vm = this;
      vm.status.loadingItem = id;
      let cart = {
        product_id: id,
        qty
      };
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/cart`;
      this.$http.post(api, { data: cart }).then(response => {
        console.log(response.data);
        vm.status.loadingItem = "";
        vm.getCart();
        $("#productModal").modal("hide");
      });
    },
    getCart() {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/cart`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.carts = response.data.data.carts;
        vm.final_total = response.data.data.final_total;
        vm.total = response.data.data.total;
        vm.isLoading = false;
      });
    },
    removeCartItem(id) {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/cart/${id}`;
      this.$http.delete(api).then(response => {
        console.log(response.data);
        vm.isLoading = false;
        vm.getCart();
      });
    },
    addCouponCode() {
      const vm = this;
      vm.isLoading = true;
      let coupon = {
        code: vm.coupon_code
      };
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/coupon`;
      this.$http.post(api, { data: coupon }).then(response => {
        console.log(response.data);
        vm.isLoading = false;
        vm.getCart();
      });
    },
    createOrder() {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/order`;
      let order = vm.form;
      this.$validator.validate().then(valid => {
        if (valid) {
          this.$http.post(api, { data: order }).then(response => {
            console.log("订单已建立", response.data);
            vm.isLoading = false;
            if(response.data.success) {
              vm.$router.push(`/customer_checkout/${response.data.orderId}`)
            }
          });
        } else {
          console.log('表单不完整');
            vm.isLoading = false;
        }
      });
    }
  },
  created() {
    this.getProducts();
    this.getCart();
  },
  components: {
    Pagination: Pagination
  }
};
</script>