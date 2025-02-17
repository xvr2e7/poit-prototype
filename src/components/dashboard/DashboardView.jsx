import React from "react";
import PoemletCard from "./PoemletCard";
import FeaturedBoard from "./FeaturedBoard";
import DailyPortal from "./DailyPortal";
import PoemFeed from "./PoemFeed";
import ProfileMenu from "./ProfileMenu";

const DashboardView = ({ userData, onStartPoiT, onOpenPoemlet }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/5 backdrop-blur-sm">
        <div className="w-full flex justify-end pr-4">
          <div className="flex items-center mt-4">
            <ProfileMenu user={userData} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-[1400px] pt-24">
        <div className="grid grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="col-span-3">
            <div className="space-y-6">
              <PoemletCard poems={userData.poems} onOpen={onOpenPoemlet} />
            </div>
          </div>

          {/* Center Column */}
          <div className="col-span-6">
            <FeaturedBoard poems={userData.featured} className="mb-12" />
            <PoemFeed className="mt-12" />
          </div>

          {/* Right Column */}
          <div className="col-span-3">
            <div className="sticky top-1/2 -translate-y-1/2 pt-12">
              <DailyPortal onEnter={onStartPoiT} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
