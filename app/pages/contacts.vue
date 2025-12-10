<template>
  <UDashboardPanel id="contacts">
    <template #header>
      <UDashboardNavbar title="Contatos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ContactsAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('email')?.getFilterValue())"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Procurar e-mails..."
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <ContactsDeleteModal
            v-model:openModal="openContactDeleteModal"
            :contact="contactDelete"
          />
          <ContactsEditModal
            v-model:openModal="openContactEditModal"
            :contact="contactEdit"
          />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} linha(s) selecionadas.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
import { getPaginationRowModel } from '@tanstack/table-core'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const contactEdit = ref()
const openContactEditModal = ref(false)

const contactDelete = ref()
const openContactDeleteModal = ref(false)

const { data, status, refresh } = await useFetch('/api/contacts', {
  lazy: true
})

function getRowItems(row) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copiar telefone',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(unFormatPhoneNumber(row.original.phone.toString()))
        toast.add({
          title: 'Telefone copiado!',
          description: 'Telefone copiado para a área de transferễncia'
        })
      }
    },
    {
      label: 'Editar contato',
      icon: 'i-lucide-pencil',
      onSelect() {
        const contact = {
          name: row.original.name,
          email: row.original.email,
          phone: unFormatPhoneNumber(row.original.phone),
          id: row.original.id
        }
        contactEdit.value = contact
        openContactEditModal.value = true
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Deletar contato',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        const contact = {
          name: row.original.name,
          id: row.original.id
        }
        contactDelete.value = contact
        openContactDeleteModal.value = true
      }
    }
  ]
}

const columns = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Nome'
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'E-mail',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ row }) => unFormatPhoneNumber(row.original.phone)
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

watch(() => openContactEditModal.value, () => refresh())
watch(() => openContactDeleteModal.value, () => refresh())

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>