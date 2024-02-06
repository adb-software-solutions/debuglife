import React from 'react';
import { SiGithub, SiFacebook, SiTwitter, SiInstagram, SiYoutube, SiX, SiLinkedin, SiPinterest } from '@icons-pack/react-simple-icons';
import { FiPackage } from "react-icons/fi";
import { PencilSquareIcon, ServerStackIcon, ExclamationCircleIcon, Square3Stack3DIcon, LightBulbIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import {
    Bars3Icon,
    BellIcon,
    ViewfinderCircleIcon,
    Cog6ToothIcon,
    XMarkIcon,
    ChartBarIcon,
    CalendarIcon,
    FolderIcon,
    HomeIcon,
    InboxIcon,
    UsersIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    QueueListIcon,
    CheckCircleIcon,
    CubeIcon,
    CurrencyPoundIcon,
    DevicePhoneMobileIcon,
  } from '@heroicons/react/24/outline';
  import { ChevronDownIcon, MagnifyingGlassIcon, CheckCircleIcon as CheckCircleIconSolid20, XMarkIcon as XMarkIconSolid20  } from '@heroicons/react/20/solid'

interface IconProps {
    iconName: string;
    className: string;
}



export default function Icon({ iconName, className }: IconProps) {
    const combinedClass = `${className}`;

    switch (iconName) {
        case 'github-solid':
            return <SiGithub className={combinedClass} />;
        case 'facebook-solid':
            return <SiFacebook className={combinedClass} />;
        case 'twitter-solid':
            return <SiTwitter className={combinedClass} />;
        case 'instagram-solid':
            return <SiInstagram className={combinedClass} />;
        case 'youtube-solid':
            return <SiYoutube className={combinedClass} />;
        case 'pinterest-solid':
            return <SiPinterest className={combinedClass} />;
        case 'x-solid':
            return <SiX className={combinedClass} />;
        case 'linkedin-solid':
            return <SiLinkedin className={combinedClass} />;
        case 'pencil-square-solid':
            return <PencilSquareIcon className={combinedClass} />;
        case 'server-stack-solid':
            return <ServerStackIcon className={combinedClass} />;
        case 'exclamation-circle-solid':
            return <ExclamationCircleIcon className={combinedClass} />;
        case 'square-3-stack-3d-solid':
            return <Square3Stack3DIcon className={combinedClass} />;
        case 'light-bulb-solid':
            return <LightBulbIcon className={combinedClass} />;
        case 'paper-clip-solid':
            return <PaperClipIcon className={combinedClass} />;
        case 'bars-3-outline':
            return <Bars3Icon className={combinedClass} />;
        case 'bell-outline':
            return <BellIcon className={combinedClass} />;
        case 'viewfinder-circle-outline':
            return <ViewfinderCircleIcon className={combinedClass} />;
        case 'cog-6-tooth-outline':
            return <Cog6ToothIcon className={combinedClass} />;
        case 'x-mark-outline':
            return <XMarkIcon className={combinedClass} />;
        case 'chart-bar-outline':
            return <ChartBarIcon className={combinedClass} />;
        case 'calendar-outline':
            return <CalendarIcon className={combinedClass} />;
        case 'folder-outline':
            return <FolderIcon className={combinedClass} />;
        case 'home-outline':
            return <HomeIcon className={combinedClass} />;
        case 'inbox-outline':
            return <InboxIcon className={combinedClass} />;
        case 'users-outline':
            return <UsersIcon className={combinedClass} />;
        case 'envelope-outline':
            return <EnvelopeIcon className={combinedClass} />;
        case 'briefcase-outline':
            return <BriefcaseIcon className={combinedClass} />;
        case 'queue-list-outline':
            return <QueueListIcon className={combinedClass} />;
        case 'check-circle-outline':
            return <CheckCircleIcon className={combinedClass} />;
        case 'cube-outline':
            return <CubeIcon className={combinedClass} />;
        case 'chevron-down-solid-20':
            return <ChevronDownIcon className={combinedClass} />;
        case 'magnifying-glass-solid-20':
            return <MagnifyingGlassIcon className={combinedClass} />;
        case 'check-circle-solid-20':
            return <CheckCircleIconSolid20 className={combinedClass} />;
        case 'x-mark-solid-20':
            return <XMarkIconSolid20 className={combinedClass} />;
        case 'fi-package':
            return <FiPackage className={combinedClass} />;
        case 'currency-pound-outline':
            return <CurrencyPoundIcon className={combinedClass} />;
        case 'device-phone-mobile-outline':
            return <DevicePhoneMobileIcon className={combinedClass} />;
        default:
            return <></>;
    }
};
