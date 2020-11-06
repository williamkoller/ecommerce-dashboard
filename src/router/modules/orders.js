import Layout from '@/views/layout/Layout'

export default {
  path: '/orders',
  component: Layout,
  redirect: '/orders/all',
  name: 'Orders',
  meta: {
    title: 'Pedidos',
    icon: 'shopping'
  },
  children: [
    {
      path: 'all',
      component: () => import('@/views/orders/index'),
      name: 'AllOrders',
      hidden: true,
      meta: { title: 'Todos os Pedidos', icon: '' }
    },
    {
      path: 'new',
      component: () => import('@/views/orders/editor'),
      name: 'NewOrder',
      hidden: true,
      meta: { title: 'Novo Pedido' }
    },
    {
      path: ':id',
      component: () => import('@/views/orders/editor'),
      name: 'EditOrder',
      hidden: true,
      meta: { title: 'Editar Pedido' }
    }
  ]
}
