import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapComponent from "./Map";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapModal({ isOpen, onClose }: MapModalProps) {
  const { user, setUser } = useContext(mainContext);
  const navigate = useNavigate();
  const [bottomLeft, setBottomLeft] = useState<[number, number] | null>(null);
  const [topRight, setTopRight] = useState<[number, number] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const defaultBottomLeft: [number, number] = [52.5, 13.39];
    const defaultTopRight: [number, number] = [52.54, 13.42];
    const bl = (user as any)?.location?.bottomLeft ?? defaultBottomLeft;
    const tr = (user as any)?.location?.topRight ?? defaultTopRight;
    setBottomLeft(bl as [number, number]);
    setTopRight(tr as [number, number]);
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!bottomLeft || !topRight || !user) return;
    setSaving(true);
    try {
      const updatedUser = {
        ...user,
        location: { bottomLeft, topRight },
      };
      setUser(updatedUser);
      await axiosPublic.post("/userprofil", updatedUser, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      onClose();
      navigate("/coordination-results");
    } catch (e) {
      console.error("Failed by Coordination :", e);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black">Coordination</h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary"
          >
            close
          </button>
        </div>
        <div
          className="rounded overflow-hidden border border-secondary-subtle"
          style={{ height: "20rem" }}
        >
          <MapComponent
            bottomLeft={bottomLeft}
            topRight={topRight}
            setBottomLeft={(coords) => setBottomLeft(coords)}
            setTopRight={(coords) => setTopRight(coords)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-light">
            cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-dark"
            disabled={saving}
          >
            {saving ? "loading..." : "Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
