<template>
  <div>
    <!-- 使用模块 vue-loading-overlay 在读取数据时页面会出现加载指示 -->
    <!-- https://github.com/ankurk91/vue-loading-overlay -->
    <loading :active.sync="isLoading"></loading>
    <div class="text-right mt-4">
      <button type="button" class="btn btn-primary text-white" @click="openModal(true)">建立新的优惠券</button>
    </div>
    <table class="table mt-4">
      <thead>
        <tr>
          <th>名称</th>
          <th width="120">折扣百分比</th>
          <th width="150">到期日</th>
          <th width="100">是否启用</th>
          <th width="120">编辑</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in coupons" :key="item.id" :class="{ 'text-secondary': !item.is_enabled }">
          <td>{{ item.title }}</td>
          <td>{{ item.percent }}%</td>
          <td>{{ item.due_date }}</td>
          <td>
            <span class="text-success" v-if="item.is_enabled">启用</span>
            <span v-else>未启用</span>
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
    <Pagination :pagination="pagination" @changePage="getCoupons"></Pagination>

    <!-- Coupon Modal -->
    <div
      class="modal fade"
      id="couponModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="couponModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content border-0">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title" id="couponModalLabel">
              <span>新增优惠券</span>
            </h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="text-white">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="title" class="col-form-label">标题</label>
                <input type="text" class="form-control" id="title" v-model="tempCoupon.title" />
              </div>
              <div class="form-group">
                <label for="code" class="col-form-label">优惠码</label>
                <input type="text" class="form-control" id="code" v-model="tempCoupon.code" />
              </div>
              <div class="form-group">
                <label for="date" class="col-form-label">到期日</label>
                <input type="date" class="form-control" id="date" v-model="tempCoupon.due_date" />
              </div>
              <div class="form-group">
                <label for="percent" class="col-form-label">折扣百分比</label>
                <input type="number" class="form-control" id="percent" v-model="tempCoupon.percent" />
              </div>
              <div class="form-group">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="is_enabled"
                    v-model="tempCoupon.is_enabled"
                    :true-value="1"
                    :false-value="0"
                  />
                  <label class="form-check-label" for="is_enabled">是否启用</label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="updateCoupon">确认</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Delete Modal -->
    <div
      class="modal fade"
      id="delCouponModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="delCouponModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content border-0">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="delCouponModalLabel">
              <span>删除优惠券</span>
            </h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="text-white">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            是否删除
            <strong class="text-danger">{{ tempCoupon.title }}</strong> 优惠券（删除后将无法恢复）。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="deleteCoupon">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 在 Vue 中需要使用 jquery 功能（如 $ 别名）需要将其导入
import $ from "jquery";
import Pagination from "@/components/Pagination";

export default {
  data() {
    return {
      coupons: [],
      pagination: {},
      tempCoupon: {},
      isNew: false,
      isLoading: false
    };
  },
  methods: {
    getCoupons(page = 1) {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/coupons?page=${page}`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.coupons = response.data.coupons;
        vm.pagination = response.data.pagination;
        vm.isLoading = false;
      });
    },
    openModal(isNew, item) {
      if (isNew) {
        // 模态框中的优惠券是新增的优惠券
        this.tempCoupon = {};
        this.isNew = true;
      } else {
        // 模态框中的优惠券是已存在的优惠券
        // 浅拷贝 item 商品对象到 tempCoupon
        this.tempCoupon = Object.assign({}, item);
        this.isNew = false;
      }
      $("#couponModal").modal("show");
    },
    updateCoupon() {
      const vm = this;
      let api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/coupon`;
      let httpMethod = "post";
      if (!vm.isNew) {
        api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/coupon/${vm.tempCoupon.id}`;
        httpMethod = "put";
      }

      this.$http[httpMethod](api, { data: vm.tempCoupon }).then(response => {
        console.log(response.data);
        if (response.data.success) {
          $("#couponModal").modal("hide");
          vm.getCoupons();
        } else {
          $("#couponModal").modal("hide");
          vm.getCoupons();
          console.log("新增商品失败");
        }
      });
    },
    openDeleteModal(item) {
      const vm = this;
      vm.tempCoupon = item;
      $("#delCouponModal").modal("show");
    },
    deleteCoupon() {
      const vm = this;
      let api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/coupon/${vm.tempCoupon.id}`;
      this.$http.delete(api).then(response => {
        console.log(response.data);
        if (response.data.success) {
          $("#delCouponModal").modal("hide");
          vm.getCoupons();
        } else {
          $("#delCouponModal").modal("hide");
          vm.getCoupons();
          console.log("删除商品失败");
        }
      });
    }
  },
  created() {
    this.getCoupons();
  },
  components: {
    Pagination: Pagination
  }
};
</script>