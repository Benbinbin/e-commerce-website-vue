<template>
  <div>
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: !pagination.has_pre }">
          <a class="page-link" href="#" @click.prevent="updatePage(pagination.current_page - 1)">Previous</a>
        </li>
        <li
          class="page-item"
          :class="{ active: page == pagination.current_page }"
          v-for="page in pagination.total_pages"
          :key="page"
        >
          <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: !pagination.has_next }">
          <a class="page-link" href="#" @click.prevent="updatePage(pagination.current_page + 1)">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["pagination"],
  methods: {
    updatePage(page) {
      this.$emit('changePage', page);
    }
  }
};
</script>