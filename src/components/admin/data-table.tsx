"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { MdDelete } from "react-icons/md";
import { DeleteOutlined } from "@ant-design/icons";
import { Input, Select, Table, Button, Space, Pagination } from "antd";
import ConfirmationBox from "@/components/confirmation.box";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  total: number;
  page: number;
  limit: number;
  searchKey?: string;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
  sortOptions?: { value: string; label: string }[];
  basePath: string;
  onDelete?: (id: string) => void;
  bulkDelete?: {
    deleteUrl: string;
    title: string;
    message: string;
    successMessage?: string;
    errorMessage?: string;
  };
  idKey?: keyof T;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  total,
  page,
  limit,
  searchKey = "search",
  filterOptions,
  sortOptions,
  basePath,
  onDelete,
  bulkDelete,
  idKey = "id" as keyof T,
  actions,
}: DataTableProps<T>) {
  const { Option } = Select;
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [data, page]);

  const updateParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === undefined) params.delete(k);
      else params.set(k, String(v));
    });
    params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  };

  const search = searchParams.get(searchKey) || "";

  const handleBulkDelete = () => {
    if (!bulkDelete || selectedRowKeys.length === 0) return;

    const selectedIds = selectedRowKeys.map(String);

    confirmAlert({
      customUI: ({ onClose }: { onClose: () => void }) => (
        <ConfirmationBox
          icon={<MdDelete />}
          judul={bulkDelete.title}
          pesan={`${bulkDelete.message} (${selectedIds.length} item)`}
          onClose={onClose}
          onClickIya={async () => {
            setIsBulkDeleting(true);
            try {
              const results = await Promise.all(
                selectedIds.map((id) => fetch(`${bulkDelete.deleteUrl}/${id}`, { method: "DELETE" }))
              );
              if (results.some((result) => !result.ok)) throw new Error();
              toast.success(bulkDelete.successMessage || "Berhasil dihapus");
              setSelectedRowKeys([]);
              router.refresh();
            } catch {
              toast.error(bulkDelete.errorMessage || "Gagal menghapus");
            } finally {
              setIsBulkDeleting(false);
              onClose();
            }
          }}
          labelIya="Ya, Hapus"
          labelTidak="Batal"
          yesButtonClassName="bg-red-500 text-white"
        />
      ),
    });
  };

  const tableColumns = [
    ...(onDelete || actions
      ? [
        {
          title: "Aksi",
          key: "__actions",
          render: (_value: unknown, record: T) => (
            <Space>
              {actions?.(record)}
              {onDelete && (
                <Button type="link" danger onClick={() => onDelete(String(record[idKey]))}>
                  Hapus
                </Button>
              )}
            </Space>
          ),
        },
      ]
      : []),
    ...columns.map((col) => ({
      title: col.header,
      dataIndex: col.key,
      key: col.key,
      align: col.align,
      render: col.render
        ? (_value: unknown, record: T) => col.render ? col.render(record) : null
        : undefined,
    })),
  ];

  return (
    <div className="space-y-4">
      <Space wrap className="w-full">
        {bulkDelete && selectedRowKeys.length > 0 && (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            loading={isBulkDeleting}
            onClick={handleBulkDelete}
          >
            Hapus Terpilih ({selectedRowKeys.length})
          </Button>
        )}
        {searchKey && (
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => updateParams({ [searchKey]: e.target.value })}
            className="flex-1 min-w-[200px]"
          />
        )}
        {filterOptions?.map((filter) => {
          const paramValue = searchParams.get(filter.key);
          const value = paramValue && paramValue !== "" ? paramValue : filter.options[0]?.value;
          return (
            <Select
              key={filter.key}
              value={value}
              onChange={(selected) =>
                updateParams({ [filter.key]: selected || filter.options[0]?.value })
              }
              className="min-w-[160px]"
            >
              {filter.options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          );
        })}
        {sortOptions && (
          <Select
            value={
              (searchParams.get("sort") && searchParams.get("sort") !== ""
                ? searchParams.get("sort")
                : sortOptions[0]?.value) || undefined
            }
            onChange={(selected) =>
              updateParams({ sort: selected || sortOptions[0]?.value })
            }
            className="min-w-[160px]"
          >
            {sortOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}
      </Space>

      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
        <Table
          rowKey={(record) => String(record[idKey])}
          rowSelection={
            bulkDelete
              ? {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys),
                }
              : undefined
          }
          columns={tableColumns as any}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-600">
            Halaman {page} dari {totalPages} (Total: {total})
          </p>
          <Pagination
            current={page}
            total={total}
            pageSize={limit}
            onChange={(nextPage) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(nextPage));
              router.push(`${basePath}?${params.toString()}`);
            }}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}