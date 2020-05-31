<template>
  <div>
    <!-- 使用模块 vue-loading-overlay 在读取数据时页面会出现加载指示 -->
    <!-- https://github.com/ankurk91/vue-loading-overlay -->
    <loading :active.sync="isLoading"></loading>
    <table class="table mt-4">
      <thead>
        <tr>
          <th width="100">购买日期</th>
          <th width="120">Email</th>
          <th>商品清单</th>
          <th width="150">应付金额</th>
          <th width="100">是否付款</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in orders" :key="item.id" :class="{'text-secondary': !item.is_paid}">
          <td>{{ item.create_at | time }}</td>
          <td>{{ item.user.email }}</td>
          <td>
            <ul>
              <li
                v-for="product in item.products"
                :key="product.id"
              >{{ product.product.title }} 数量：{{ product.product.num }}</li>
            </ul>
          </td>
          <td class="text-right">{{ item.total | currency }}</td>
          <td>
              <span class="text-success" v-if="item.is_paid">已付款</span>
              <span v-else>尚未付款</span>
          </td>

        </tr>
      </tbody>
    </table>
    <Pagination :pagination="pagination" @changePage="getOrders"></Pagination>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination';

export default {
data() {
    return {
      orders: [],
      pagination: {},
      products: [],
      isLoading: false,
    };
  },
  methods: {
    getOrders(page = 1) {
      const vm = this;
      vm.isLoading = true;
      const api = `${process.env.API_PATH}/api/${process.env.CUSTOM_PATH}/admin/orders?page=${page}`;
      this.$http.get(api).then(response => {
        console.log(response.data);
        vm.orders = response.data.orders;
        vm.pagination = response.data.pagination;
        vm.isLoading = false;
      });
    },
  },
  created() {
      this.getOrders();
  },
  components: {
    'Pagination': Pagination,
  }
}
</script>