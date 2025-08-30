# DNS记录ID字段修正说明

## 问题发现

用户指出在DNS记录修改接口中，`id`参数应该是DNS记录的主键ID，而不是`recordId`字段。

## 修正内容

### 1. 接口调用修正 ✅

**修改前**：
```typescript
// 错误：使用recordId调用接口
await dnsService.updateDnsRecord(editingRecord.value.recordId, updateParams)
await dnsService.deleteDnsRecord(record.recordId)
```

**修改后**：
```typescript
// 正确：使用DNS记录的主键ID
await dnsService.updateDnsRecord(editingRecord.value.id, updateParams)
await dnsService.deleteDnsRecord(record.id)
```

### 2. 服务方法更新 ✅

**DNS服务方法参数说明更新**：
- `updateDnsRecord(id, params)` - id是DNS记录的主键ID
- `deleteDnsRecord(id)` - id是DNS记录的主键ID
- `enableDnsRecord(id)` - id是DNS记录的主键ID
- `disableDnsRecord(id)` - id是DNS记录的主键ID

### 3. 测试用例修正 ✅

更新了所有测试用例，确保使用正确的ID字段进行测试验证。

## 数据结构说明

根据接口文档，DNS记录的数据结构包含：

```typescript
interface DnsRecord {
  id: number          // 主键ID - 用于修改和删除操作
  recordId: number    // DNSPod记录ID - 用于同步操作
  userId: number      // 用户ID
  subdomainId: number // 子域名ID
  // ... 其他字段
}
```

## 关键区别

- **id**: DNS记录在本地数据库中的主键ID，用于修改和删除操作
- **recordId**: DNSPod平台上的记录ID，用于与DNSPod API同步

## 修正影响

✅ **接口调用正确性**: 确保修改和删除操作使用正确的ID字段
✅ **数据一致性**: 避免因ID混淆导致的数据操作错误
✅ **测试准确性**: 测试用例验证正确的接口调用方式

## 验证方法

1. 运行集成测试确保所有测试通过
2. 在开发环境中测试DNS记录的修改和删除功能
3. 检查网络请求确认传递的是正确的ID参数

这个修正确保了DNS记录管理功能的正确性和数据安全性。