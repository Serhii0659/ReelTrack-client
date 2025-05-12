import Header from '../components/Header';
import NowWatching from '../components/NowWatching';
import NewReleases from '../components/NewReleases';
import ReviewTabs from '../components/ReviewTabs';
import UserStatistics from '../components/UserStatistics';

const HomePage = () => {
  return (
    <div className="bg-[#171717] min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 pt-[72px]">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-white font-bold text-[48px] text-center mb-8">
            Твій особистий світ кіно
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <NewReleases />
            </div>
            <div>
              <NowWatching />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-4 mt-6">
            <div>
              <ReviewTabs />
            </div>
            <div>
              <UserStatistics />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
