import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ReceiptIndianRupee, CheckCircle2 } from 'lucide-react';

export const MyFines = () => {
  const { error } = useToast();
  const [finesData, setFinesData] = useState({ fines: [], totalOutstandingFine: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const res = await api.get('/member/my-fines');
        setFinesData(res.data.data);
      } catch (err) {
        error('Failed to load fines summary');
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, [error]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading fine ledger...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Fines & Penalties</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed itemization of overdue penalties accrued on your library card.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Outstanding Balance
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            ₹{finesData.totalOutstandingFine}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
          <ReceiptIndianRupee className="w-8 h-8" />
        </div>
      </div>

      {finesData.fines.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-emerald-900">No Outstanding Fines</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Your account is in good standing with zero overdue penalties!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Return Date</th>
                  <th className="px-6 py-3.5">Overdue Days</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Fine Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finesData.fines.map((item) => (
                  <tr key={item.borrowingId} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.book?.title}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Pending Return'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{item.daysOverdue} Days</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'Pending' ? 'danger' : 'warning'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      ₹{item.fine}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
